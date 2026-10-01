#!/usr/bin/env node
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  existsSync,
  openSync,
  closeSync,
  realpathSync,
} from 'node:fs'
import { resolve, join, dirname, relative, isAbsolute, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'

export class ContractError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}
const fail = (code, message) => {
  throw new ContractError(code, message)
}
const requireValue = (value, name) => {
  if (typeof value !== 'string' || !value.trim())
    fail('INVALID_INPUT', `${name} must be a nonempty string`)
  return value
}
const validId = (id) => {
  if (!/^[a-zA-Z0-9_-]+$/.test(id ?? '')) fail('INVALID_ID', 'IDs must be opaque path-safe strings')
  return id
}
export function defaultStore(kind, id, cwd = process.cwd()) {
  validId(id)
  let parent
  try {
    parent = resolve(
      cwd,
      execFileSync('git', ['rev-parse', '--git-common-dir'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim(),
      'toolbox',
      kind,
    )
  } catch {
    parent = resolve(cwd, '.toolbox', kind)
  }
  return join(parent, id)
}
function validate(state) {
  if (state.schemaVersion !== 1) fail('UNKNOWN_SCHEMA', 'Unsupported run schema')
  if (
    !Number.isInteger(state.revision) ||
    !state.coordinator?.epoch ||
    !state.units ||
    !state.attempts ||
    !state.evidence
  )
    fail('CORRUPT_STATE', 'Incomplete run state')
  const visit = (id, active = new Set(), done = new Set()) => {
    if (active.has(id)) fail('CYCLE', `Dependency cycle at ${id}`)
    if (done.has(id)) return
    const unit = state.units[id]
    if (!unit) fail('MISSING_DEPENDENCY', id)
    active.add(id)
    for (const dep of unit.dependencies) visit(dep, active, done)
    active.delete(id)
    done.add(id)
  }
  for (const id of Object.keys(state.units)) visit(id)
}
export function load(store) {
  let state
  try {
    state = JSON.parse(readFileSync(join(store, 'state.json'), 'utf8'))
  } catch {
    fail('CORRUPT_STATE', 'Cannot read run; use explicit recovery with verified previous snapshot')
  }
  validate(state)
  return state
}
function canonicalScope(path) {
  let existing = resolve(path)
  const suffix = []
  while (!existsSync(existing)) {
    suffix.unshift(existing.slice(dirname(existing).length + 1))
    const parent = dirname(existing)
    if (parent === existing) break
    existing = parent
  }
  return resolve(realpathSync(existing), ...suffix)
}
function overlaps(a, b) {
  const nested = (x, y) => {
    const r = relative(x, y)
    return !r || (r !== '..' && !r.startsWith(`..${sep}`) && !isAbsolute(r))
  }
  return nested(a, b) || nested(b, a)
}
function invalidate(state, id, seen = new Set()) {
  if (seen.has(id)) return
  seen.add(id)
  const unit = state.units[id]
  for (const evidence of Object.values(state.evidence))
    if (evidence.unit === id) evidence.current = false
  unit.state = unit.state === 'cancelled' ? 'cancelled' : 'queued'
  if (unit.attempt && state.attempts[unit.attempt].hostTerminal === false) {
    state.attempts[unit.attempt].superseded = true
    unit.state = 'blocked'
    unit.blocker = 'Prior writer termination unknown'
  }
  for (const downstream of Object.values(state.units))
    if (downstream.dependencies.includes(id)) invalidate(state, downstream.id, seen)
}
export function transition(state, command, input) {
  const unit = input.unit ? state.units[input.unit] : undefined
  if (command === 'unit') {
    const id = validId(input.id)
    const prior = state.units[id]
    if (input.action === 'add') {
      if (prior) fail('DUPLICATE_ID', id)
      const dependencies = input.dependencies ?? []
      if (!Array.isArray(dependencies) || dependencies.some((x) => typeof x !== 'string'))
        fail('INVALID_INPUT', 'dependencies must be IDs')
      state.units[id] = {
        id,
        dependencies,
        scope: (input.scope ?? []).map((x) => canonicalScope(requireValue(x, 'scope'))),
        inputFingerprint: requireValue(input.inputFingerprint, 'inputFingerprint'),
        criteria: input.criteria ?? [],
        state: 'queued',
      }
      if (!state.units[id].scope.length || !state.units[id].criteria.length)
        fail('INVALID_INPUT', 'scope and criteria required')
    } else {
      if (!prior) fail('UNKNOWN_UNIT', id)
      if (input.action === 'invalidate') {
        prior.inputFingerprint = requireValue(input.inputFingerprint, 'inputFingerprint')
        invalidate(state, id)
      } else if (input.action === 'cancel') {
        prior.state = 'cancelled'
        if (prior.attempt) state.attempts[prior.attempt].cancelRequested = true
      } else if (input.action === 'block' || input.action === 'fail') {
        prior.state = input.action === 'block' ? 'blocked' : 'failed'
        prior.blocker = requireValue(input.reason, 'reason')
      } else if (input.action === 'queue') {
        if (!['blocked', 'failed'].includes(prior.state))
          fail('INVALID_TRANSITION', 'Only blocked/failed work can be queued')
        const attempt = state.attempts[prior.attempt]
        if (attempt && !attempt.hostTerminal) fail('WRITER_ACTIVE', 'Observe terminal worker first')
        if (prior.state === 'failed') {
          if (!input.transient || !input.idempotent || (prior.retries ?? 0) >= 1)
            fail('RETRY_DENIED', 'One diagnosed transient idempotent retry only')
          requireValue(input.reason, 'retry diagnosis')
          prior.retries = (prior.retries ?? 0) + 1
        }
        prior.state = 'queued'
        delete prior.blocker
      } else fail('INVALID_ACTION', 'Unknown unit action')
    }
  } else if (command === 'attempt') {
    if (!unit) fail('UNKNOWN_UNIT', input.unit)
    if (input.action === 'start') {
      if (unit.state !== 'queued') fail('INVALID_TRANSITION', 'Unit must be queued')
      if (unit.dependencies.some((id) => state.units[id]?.state !== 'verified'))
        fail('NOT_READY', 'Current verified prerequisites required')
      for (const attempt of Object.values(state.attempts))
        if (
          !attempt.hostTerminal &&
          unit.scope.some((a) => attempt.scope.some((b) => overlaps(a, b)))
        )
          fail('WRITER_ACTIVE', 'Overlapping writable scope is owned')
      const id = validId(input.id)
      if (state.attempts[id]) fail('DUPLICATE_ID', id)
      state.attempts[id] = {
        id,
        unit: unit.id,
        worker: requireValue(input.worker, 'worker'),
        inputFingerprint: unit.inputFingerprint,
        scope: unit.scope,
        hostTerminal: false,
        cancelRequested: false,
        superseded: false,
        result: null,
        upstream: Object.fromEntries(
          unit.dependencies.map((id) => [id, state.units[id].inputFingerprint]),
        ),
      }
      unit.attempt = id
      unit.state = 'running'
    } else {
      const attempt = state.attempts[input.id]
      if (!attempt || attempt.unit !== unit.id) fail('UNKNOWN_ATTEMPT', input.id)
      if (input.action === 'report') {
        const result = {
          outputs: input.outputs ?? [],
          outcome: requireValue(input.outcome, 'outcome'),
        }
        if (!['completed', 'failed'].includes(result.outcome))
          fail('INVALID_INPUT', 'Report outcome completed or failed')
        if (attempt.result) {
          if (JSON.stringify(attempt.result) !== JSON.stringify(result))
            fail('CONFLICTING_REPORT', 'Report already frozen')
          return
        }
        attempt.result = result
        if (unit.attempt === attempt.id && !attempt.superseded && unit.state !== 'cancelled') {
          if (attempt.inputFingerprint !== unit.inputFingerprint)
            fail('STALE_INPUT', 'Report inputs stale')
          if (result.outcome === 'completed' && !result.outputs.length)
            fail('MISSING_OUTPUT', 'Completed output references required')
          unit.state = result.outcome === 'completed' ? 'awaiting-verification' : 'failed'
        }
      } else if (input.action === 'terminal') {
        if (!['completed', 'failed', 'cancelled'].includes(input.status))
          fail('INVALID_INPUT', 'Terminal host status required')
        attempt.hostTerminal = true
        attempt.terminalReceipt = requireValue(input.receipt, 'host receipt')
        attempt.terminalStatus = input.status
      } else fail('INVALID_ACTION', 'Unknown attempt action')
    }
  } else if (command === 'evidence') {
    if (!unit) fail('UNKNOWN_UNIT', input.unit)
    if (input.inputFingerprint !== unit.inputFingerprint)
      fail('STALE_INPUT', 'Evidence does not match current inputs')
    const id = validId(input.id)
    if (state.evidence[id]) fail('DUPLICATE_ID', id)
    if (!unit.criteria.includes(input.requirement))
      fail('UNKNOWN_REQUIREMENT', 'Evidence must prove a declared criterion')
    state.evidence[id] = {
      id,
      unit: unit.id,
      requirement: input.requirement,
      inputFingerprint: input.inputFingerprint,
      artifact: requireValue(input.artifact, 'artifact'),
      observation: requireValue(input.observation, 'observation'),
      environment: input.environment ?? {},
      passed: input.passed === true,
      current: true,
    }
  } else if (command === 'decision') {
    const id = validId(input.id)
    if (state.decisions[id]) fail('DUPLICATE_ID', id)
    state.decisions[id] = {
      id,
      scope: requireValue(input.scope, 'scope'),
      decision: requireValue(input.decision, 'decision'),
      rationale: requireValue(input.rationale, 'rationale'),
      reopening: requireValue(input.reopening, 'reopening'),
    }
  } else if (command === 'reconcile') {
    if (input.action === 'takeover') {
      if (!(input.priorOwnerTerminal || input.explicitHandoff))
        fail('OWNER_UNKNOWN', 'Terminal owner proof or explicit handoff required')
      requireValue(input.receipt, 'takeover receipt')
      state.coordinator = {
        identity: requireValue(input.coordinator, 'coordinator'),
        epoch: state.coordinator.epoch + 1,
        receipt: input.receipt,
      }
    } else if (input.action === 'verify') {
      if (!unit || unit.state !== 'awaiting-verification')
        fail('INVALID_TRANSITION', 'Completed current attempt required')
      const attempt = state.attempts[unit.attempt]
      if (
        !attempt.hostTerminal ||
        attempt.superseded ||
        attempt.inputFingerprint !== unit.inputFingerprint
      )
        fail('INCOMPLETE', 'Current terminal attempt required')
      if (
        unit.dependencies.some(
          (id) =>
            state.units[id].state !== 'verified' ||
            attempt.upstream[id] !== state.units[id].inputFingerprint,
        )
      )
        fail('STALE_INPUT', 'Upstream changed')
      if (
        !unit.criteria.every((requirement) =>
          Object.values(state.evidence).some(
            (e) =>
              e.unit === unit.id &&
              e.requirement === requirement &&
              e.current &&
              e.passed &&
              e.inputFingerprint === unit.inputFingerprint,
          ),
        )
      )
        fail('INCOMPLETE', 'Every criterion needs current passing evidence')
      unit.state = 'verified'
      unit.integration = requireValue(input.integration, 'integrated target receipt')
    } else fail('INVALID_ACTION', 'Unknown reconcile action')
  } else fail('INVALID_COMMAND', command)
  validate(state)
}
export function operate(store, command, input = {}) {
  store = resolve(store)
  if (['status', 'export'].includes(command)) return load(store)
  mkdirSync(store, { recursive: true })
  const lock = join(store, 'writer.lock')
  let handle
  try {
    handle = openSync(lock, 'wx')
  } catch {
    fail('LOCKED', 'Writer lock exists; reconcile owner before explicit lock recovery')
  }
  try {
    let state
    if (command === 'init') {
      if (existsSync(join(store, 'state.json'))) fail('ALREADY_EXISTS', 'Run exists')
      state = {
        schemaVersion: 1,
        id: validId(input.id),
        repository: resolve(requireValue(input.repository, 'repository')),
        objective: requireValue(input.objective, 'objective'),
        revision: 0,
        coordinator: { identity: requireValue(input.coordinator, 'coordinator'), epoch: 1 },
        units: {},
        attempts: {},
        evidence: {},
        decisions: {},
      }
    } else {
      state = load(store)
      if (input.expectedRevision !== state.revision)
        fail('STALE_REVISION', `Expected ${state.revision}`)
      if (input.epoch !== state.coordinator.epoch)
        fail('STALE_EPOCH', 'Coordinator no longer owns run')
      if (input.repository && resolve(input.repository) !== state.repository)
        fail('WRONG_REPOSITORY', 'Repository identity mismatch')
      transition(state, command, input)
      state.revision++
    }
    validate(state)
    const current = join(store, 'state.json')
    if (existsSync(current)) {
      const previous = join(store, 'previous.tmp')
      writeFileSync(previous, readFileSync(current), { mode: 0o600, flush: true })
      renameSync(previous, join(store, 'previous.json'))
    }
    const temporary = join(store, `state-${randomUUID()}.tmp`)
    writeFileSync(temporary, JSON.stringify(state, null, 2) + '\n', { mode: 0o600, flush: true })
    renameSync(temporary, current)
    return state
  } finally {
    closeSync(handle)
    unlinkSync(lock)
  }
}
export function recover(store, input) {
  if (!(input.priorOwnerTerminal || input.explicitHandoff) || !input.receipt)
    fail('OWNER_UNKNOWN', 'Verified owner termination/handoff required for recovery')
  const previous = JSON.parse(readFileSync(join(store, 'previous.json'), 'utf8'))
  validate(previous)
  if (input.expectedPreviousRevision !== previous.revision)
    fail('STALE_REVISION', 'Verify previous snapshot before recovery')
  // Explicit recovery is exclusive, even if an abandoned lock must first be removed by the operator.
  if (existsSync(join(store, 'writer.lock')))
    fail('LOCKED', 'Reconcile and explicitly remove abandoned lock before recovery')
  let fd
  try {
    fd = openSync(join(store, 'writer.lock'), 'wx')
    previous.coordinator.epoch++
    previous.revision++
    previous.recoveryReceipt = input.receipt
    writeFileSync(join(store, 'recovery.tmp'), JSON.stringify(previous, null, 2), {
      mode: 0o600,
      flush: true,
    })
    renameSync(join(store, 'recovery.tmp'), join(store, 'state.json'))
    return previous
  } finally {
    if (fd !== undefined) {
      closeSync(fd)
      unlinkSync(join(store, 'writer.lock'))
    }
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...args] = process.argv.slice(2)
    if (!command || command === '--help') {
      console.log(
        'run.mjs <init|status|unit|attempt|evidence|decision|reconcile|export|recover> --store <run-directory> [--input <JSON-file>]\nMutations require expectedRevision and epoch. See references/helper.md.',
      )
      process.exit(0)
    }
    const arg = (name) => args[args.indexOf(name) + 1]
    const input = args.includes('--input') ? JSON.parse(readFileSync(arg('--input'), 'utf8')) : {}
    const store = args.includes('--store')
      ? arg('--store')
      : defaultStore('runs', input.id ?? input.run)
    console.log(
      JSON.stringify(
        command === 'recover' ? recover(store, input) : operate(store, command, input),
        null,
        2,
      ),
    )
  } catch (error) {
    console.error(JSON.stringify({ code: error.code ?? 'IO_ERROR', message: error.message }))
    process.exitCode = 1
  }
}
