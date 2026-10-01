#!/usr/bin/env node
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  openSync,
  closeSync,
  unlinkSync,
} from 'node:fs'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { randomUUID, createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { validateGithubAnchors, githubReviewArguments, validateGithubReceipt } from './github.mjs'

export class ReviewError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}
const fail = (code, message) => {
  throw new ReviewError(code, message)
}
const required = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) fail('INVALID_INPUT', `${name} required`)
  return value
}
const id = (value) => {
  if (!/^[a-zA-Z0-9_-]+$/.test(value ?? '')) fail('INVALID_ID', 'Path-safe ID required')
  return value
}
const digest = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
export function reviewStore(run, cwd = process.cwd()) {
  id(run)
  let base
  try {
    base = resolve(
      cwd,
      execFileSync('git', ['rev-parse', '--git-common-dir'], {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim(),
      'toolbox',
      'reviews',
    )
  } catch {
    base = resolve(cwd, '.toolbox', 'reviews')
  }
  return join(base, run)
}
export function readReview(store) {
  let state
  try {
    state = JSON.parse(readFileSync(join(store, 'review.json'), 'utf8'))
  } catch {
    fail('CORRUPT_STATE', 'Review cannot be read')
  }
  if (state.schemaVersion !== 1) fail('UNKNOWN_SCHEMA', 'Unsupported review schema')
  if (!Number.isInteger(state.revision) || !state.operations || !state.target || !state.source)
    fail('CORRUPT_STATE', 'Invalid review state')
  if (
    state.initial &&
    digest(readFileSync(join(store, 'initial-report.md'), 'utf8')) !== state.initial.digest
  )
    fail('CORRUPT_STATE', 'Frozen initial report changed')
  return state
}
function validatePayload(payload, state, input) {
  if (payload.event !== 'COMMENT')
    fail(
      'AUTHORITY_REQUIRED',
      'This adapter only submits COMMENT; formal states use separately authorized host tools',
    )
  if (payload.commit_id !== state.reviewedCommit)
    fail('STALE_SOURCE', 'Publish payload not bound to reviewed commit')
  if (!payload.body?.includes(state.marker)) fail('MISSING_MARKER', 'Body must include run marker')
  if (githubReviewArguments(state.target, payload)) {
    try {
      validateGithubAnchors(payload, state, input.anchorReceipt)
    } catch (error) {
      fail('INVALID_ANCHOR', error.message)
    }
  } else if ((payload.comments ?? []).length) {
    fail('UNSUPPORTED_ADAPTER', 'Inline comments require a supported adapter')
  }
}
export function changeReview(state, command, input, store) {
  const writeOnce = (name, text) => {
    if (existsSync(join(store, name))) {
      if (readFileSync(join(store, name), 'utf8') === text) return
      fail('IMMUTABLE_ARTIFACT', name)
    }
    writeFileSync(join(store, name), required(text, name), { flag: 'wx', mode: 0o600, flush: true })
  }
  if (command === 'freeze') {
    if (state.initial) fail('ALREADY_FROZEN', 'Initial report already frozen')
    const text = required(input.report, 'report')
    writeOnce('initial-report.md', text)
    state.initial = {
      digest: digest(text),
      context: input.context ?? [],
      exposure: input.exposure ?? [],
      isolation: input.isolation === 'fresh' ? 'fresh' : 'exposed',
      checks: input.checks ?? [],
    }
  } else if (command === 'reconcile') {
    if (!state.initial) fail('INITIAL_REQUIRED', 'Freeze first report before history')
    const receipt = required(input.receipt, 'history receipt')
    if (!Array.isArray(input.unresolved ?? [])) fail('INVALID_INPUT', 'unresolved must be a list')
    writeOnce('reconciliation.md', input.report)
    state.reconciliation = { unresolved: input.unresolved ?? [], receipt }
  } else if (command === 'assess') {
    if (!state.initial || !state.reconciliation)
      fail('INCOMPLETE', 'Frozen initial and reconciliation required')
    const assessments = [
      'STALE',
      'INCOMPLETE',
      'BLOCKED',
      'PASSED',
      'CLEAN',
      'FINDINGS',
      'FIXED',
      'NOT_FIXED',
      'INCONCLUSIVE',
    ]
    if (!assessments.includes(input.assessment)) fail('INVALID_INPUT', 'Unknown assessment')
    if (
      input.assessment === 'PASSED' &&
      (state.mode !== 'merge-gate' || state.initial.isolation !== 'fresh')
    )
      fail('INCOMPLETE', 'Fresh full merge gate required for PASSED')
    if (state.mode === 'closure' && ['PASSED', 'CLEAN'].includes(input.assessment))
      fail('INVALID_MODE', 'Closure cannot certify a full pass')
    if (
      state.reconciliation.unresolved.length &&
      ['PASSED', 'CLEAN', 'FIXED'].includes(input.assessment)
    )
      fail('UNRESOLVED', 'Material prior findings remain')
    if (input.currentSource !== state.source || input.currentRequirements !== state.requirements)
      fail('STALE_SOURCE', 'Assessment input changed')
    writeOnce('report.md', input.report)
    state.assessment = input.assessment
  } else if (command === 'prepare') {
    if (!state.assessment) fail('INCOMPLETE', 'Final assessment required')
    if (!input.authorityReceipt)
      fail('AUTHORITY_REQUIRED', 'Explicit target review/publication scope required')
    const operation = id(input.id)
    if (state.operations[operation]) fail('DUPLICATE_ID', 'Operation exists')
    const kind = input.kind ?? 'review'
    if (!['review', 'stale-notice'].includes(kind))
      fail('INVALID_INPUT', 'Unknown publication kind')
    if (Object.values(state.operations).some((op) => op.kind === kind))
      fail('DUPLICATE_PUBLICATION', 'Reuse and reconcile existing publication operation')
    if (
      kind === 'stale-notice' &&
      !Object.values(state.operations).some(
        (op) => op.kind === 'review' && op.state === 'published' && op.stale,
      )
    )
      fail('INVALID_TRANSITION', 'Stale notice requires a published stale review')
    if (input.currentSource !== state.source || input.currentRequirements !== state.requirements)
      fail('STALE_SOURCE', 'Inputs changed before publication')
    const payload = input.payload
    if (!payload || typeof payload !== 'object') fail('INVALID_INPUT', 'Payload required')
    validatePayload(payload, state, input)
    const frozen = {
      target: state.target,
      source: state.source,
      payload,
      marker: state.marker,
      githubArguments: githubReviewArguments(state.target, payload),
    }
    writeOnce(`payload-${operation}.json`, JSON.stringify(frozen, null, 2))
    state.operations[operation] = {
      id: operation,
      kind,
      state: 'prepared',
      digest: digest(frozen),
      authorityReceipt: input.authorityReceipt,
      anchorReceipt: input.anchorReceipt ?? null,
    }
  } else if (command === 'delivery') {
    const op = state.operations[input.id]
    if (!op) fail('UNKNOWN_OPERATION', input.id)
    const frozen = JSON.parse(readFileSync(join(store, `payload-${op.id}.json`), 'utf8'))
    if (digest(frozen) !== op.digest) fail('CORRUPT_PAYLOAD', 'Dispatch payload changed')
    if (input.action === 'dispatch') {
      if (op.state !== 'prepared')
        fail('INVALID_TRANSITION', 'Only prepared operations can dispatch')
      if (input.currentSource !== state.source || input.currentRequirements !== state.requirements)
        fail('STALE_SOURCE', 'Recheck inputs immediately before dispatch')
      op.state = 'dispatching'
    } else if (input.action === 'published') {
      if (!['dispatching', 'unknown'].includes(op.state))
        fail('INVALID_TRANSITION', 'No outstanding publication')
      if (frozen.githubArguments) {
        try {
          validateGithubReceipt(frozen.payload, input)
        } catch (error) {
          fail('UNVERIFIED_PUBLICATION', error.message)
        }
      }
      op.receipt = {
        id: required(input.providerId, 'provider review ID'),
        url: required(input.url, 'receipt URL'),
        proof: frozen.githubArguments
          ? input.receipt
          : required(input.receipt, 'remote read-back proof'),
      }
      op.state = 'published'
      op.stale =
        input.currentSource !== state.source || input.currentRequirements !== state.requirements
    } else if (input.action === 'unknown') {
      if (op.state !== 'dispatching') fail('INVALID_TRANSITION', 'Unknown only after dispatch')
      op.state = 'unknown'
      op.reason = required(input.reason, 'reason')
    } else if (input.action === 'failed-before-publication') {
      if (!['prepared', 'dispatching'].includes(op.state))
        fail('INVALID_TRANSITION', 'Cannot infer unknown non-delivery')
      op.state = 'failed'
      op.nonDeliveryProof = required(input.receipt, 'definitive pre-publication failure proof')
    } else if (input.action === 'retry') {
      if (op.state !== 'failed' || !op.nonDeliveryProof)
        fail('RETRY_DENIED', 'Unknown outcomes never retry blindly')
      op.state = 'prepared'
    } else fail('INVALID_ACTION', 'Unknown delivery action')
  } else if (command === 'local') {
    if (!state.assessment) fail('INCOMPLETE', 'Final report required')
    state.localOnly = {
      reason: required(input.reason, 'reason'),
      artifact: join(store, 'report.md'),
    }
  } else fail('INVALID_COMMAND', command)
}
export function operateReview(store, command, input = {}) {
  store = resolve(store)
  if (command === 'status') return readReview(store)
  if (command === 'adapter') {
    const state = readReview(store)
    const op = state.operations[input.id]
    if (!op) fail('UNKNOWN_OPERATION', input.id)
    const frozen = JSON.parse(readFileSync(join(store, `payload-${op.id}.json`), 'utf8'))
    if (digest(frozen) !== op.digest) fail('CORRUPT_PAYLOAD', 'Dispatch payload changed')
    if (!frozen.githubArguments) fail('UNSUPPORTED_ADAPTER', 'No frozen GitHub arguments')
    return frozen.githubArguments
  }
  mkdirSync(store, { recursive: true })
  let handle
  try {
    handle = openSync(join(store, 'publisher.lock'), 'wx')
  } catch {
    fail('LOCKED', 'Publisher active or unobserved; reconcile before recovering lock')
  }
  try {
    let state
    if (command === 'init') {
      if (existsSync(join(store, 'review.json'))) fail('ALREADY_EXISTS', 'Review exists')
      if (!['focused', 'standard', 'closure', 'merge-gate'].includes(input.mode))
        fail('INVALID_MODE', 'Review mode required')
      state = {
        schemaVersion: 1,
        revision: 0,
        id: id(input.id),
        marker: `<!-- toolbox-review:${input.id} -->`,
        target: required(input.target, 'target'),
        source: required(input.source, 'source identity'),
        reviewedCommit: input.reviewedCommit ?? input.source,
        requirements: required(input.requirements, 'requirements identity'),
        mode: input.mode,
        lenses: input.lenses ?? [],
        operations: {},
      }
    } else {
      state = readReview(store)
      if (input.expectedRevision !== state.revision)
        fail('STALE_REVISION', `Expected ${state.revision}`)
      changeReview(state, command, input, store)
      state.revision++
    }
    const temp = join(store, `review-${randomUUID()}.tmp`)
    writeFileSync(temp, JSON.stringify(state, null, 2) + '\n', { mode: 0o600, flush: true })
    renameSync(temp, join(store, 'review.json'))
    return state
  } finally {
    closeSync(handle)
    unlinkSync(join(store, 'publisher.lock'))
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...args] = process.argv.slice(2)
    if (!command || command === '--help') {
      console.log(
        'review.mjs <init|freeze|reconcile|assess|prepare|delivery|local|status|adapter> --store <run-directory> [--input <JSON-file>]\nMutations require expectedRevision. See references/helper.md.',
      )
      process.exit(0)
    }
    const arg = (name) => args[args.indexOf(name) + 1]
    const input = args.includes('--input') ? JSON.parse(readFileSync(arg('--input'), 'utf8')) : {}
    console.log(
      JSON.stringify(
        operateReview(
          args.includes('--store') ? arg('--store') : reviewStore(input.id ?? input.run),
          command,
          input,
        ),
        null,
        2,
      ),
    )
  } catch (error) {
    console.error(JSON.stringify({ code: error.code ?? 'IO_ERROR', message: error.message }))
    process.exitCode = 1
  }
}
