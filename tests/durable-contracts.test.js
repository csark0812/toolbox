import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { operate, load, recover } from '../orchestrate/scripts/run.mjs'
import { operateReview, readReview } from '../code-review/scripts/review.mjs'
import { SKILLS } from '../src/expected-skills.ts'
const dirs = []
const temp = () => {
  const p = mkdtempSync(join(tmpdir(), 'toolbox-contract-'))
  dirs.push(p)
  return p
}
afterEach(() => {
  for (const p of dirs.splice(0)) rmSync(p, { recursive: true, force: true })
})
function program() {
  const p = temp()
  let s = operate(p, 'init', {
    id: 'test',
    repository: p,
    objective: 'Two independently proven units',
    coordinator: 'coordinator',
  })
  return {
    p,
    call: (cmd, input) => {
      s = operate(p, cmd, { expectedRevision: s.revision, epoch: s.coordinator.epoch, ...input })
      return s
    },
    state: () => s,
  }
}
function add(p, id, deps = []) {
  return p.call('unit', {
    action: 'add',
    id,
    scope: [join(p.p, id)],
    dependencies: deps,
    inputFingerprint: id + '-v1',
    criteria: ['correct'],
  })
}
function finish(p, id) {
  p.call('attempt', { action: 'start', unit: id, id: id + '-attempt', worker: 'worker' })
  p.call('attempt', {
    action: 'report',
    unit: id,
    id: id + '-attempt',
    outcome: 'completed',
    outputs: ['artifact'],
  })
  p.call('attempt', {
    action: 'terminal',
    unit: id,
    id: id + '-attempt',
    status: 'completed',
    receipt: 'host-terminal',
  })
  p.call('evidence', {
    id: id + '-proof',
    unit: id,
    inputFingerprint: id + '-v1',
    requirement: 'correct',
    artifact: 'trace',
    observation: 'public contract passed',
    passed: true,
  })
  return p.call('reconcile', { action: 'verify', unit: id, integration: 'integrated-tree' })
}
it('runs the complete pilot, relays prerequisites, and invalidates descendants', () => {
  const p = program()
  add(p, 'A')
  add(p, 'B', ['A'])
  expect(() =>
    p.call('attempt', { action: 'start', unit: 'B', id: 'early', worker: 'w' }),
  ).toThrow()
  finish(p, 'A')
  finish(p, 'B')
  const s = p.call('unit', { action: 'invalidate', id: 'A', inputFingerprint: 'A-v2' })
  expect(s.units.B.state).toBe('queued')
  expect(s.evidence['B-proof'].current).toBe(false)
})
it('retains writer ownership after cancellation until actual termination', () => {
  const p = program()
  add(p, 'A')
  p.call('attempt', { action: 'start', unit: 'A', id: 'old', worker: 'w' })
  p.call('unit', { action: 'cancel', id: 'A' })
  p.call('unit', {
    action: 'add',
    id: 'replacement',
    scope: [join(p.p, 'A')],
    inputFingerprint: 'new',
    criteria: ['correct'],
  })
  expect(() =>
    p.call('attempt', { action: 'start', unit: 'replacement', id: 'new', worker: 'w2' }),
  ).toThrow(/scope/)
  p.call('attempt', {
    action: 'terminal',
    unit: 'A',
    id: 'old',
    status: 'cancelled',
    receipt: 'stop receipt',
  })
  expect(
    p.call('attempt', { action: 'start', unit: 'replacement', id: 'new', worker: 'w2' }).units
      .replacement.state,
  ).toBe('running')
})
it('rejects stale coordinators and incomplete verification without mutating state', () => {
  const p = program()
  add(p, 'A')
  const before = readFileSync(join(p.p, 'state.json'), 'utf8')
  expect(() =>
    operate(p.p, 'unit', { action: 'cancel', id: 'A', expectedRevision: 0, epoch: 1 }),
  ).toThrow()
  expect(readFileSync(join(p.p, 'state.json'), 'utf8')).toBe(before)
  expect(() => p.call('reconcile', { action: 'takeover', coordinator: 'other' })).toThrow()
  expect(load(p.p).coordinator.identity).toBe('coordinator')
})
it('requires explicit verified recovery and preserves schema boundaries', () => {
  const p = program()
  add(p, 'A')
  writeFileSync(join(p.p, 'state.json'), 'corrupt')
  expect(() => load(p.p)).toThrow()
  expect(() => recover(p.p, {})).toThrow()
  const restored = recover(p.p, {
    explicitHandoff: true,
    receipt: 'user handoff',
    expectedPreviousRevision: 0,
  })
  expect(restored.coordinator.epoch).toBe(2)
})
function review(mode = 'standard') {
  const p = temp()
  let s = operateReview(p, 'init', {
    id: 'review1',
    target: 'https://github.com/example/repo/pull/1',
    source: 'head1',
    requirements: 'requirements1',
    mode,
  })
  return {
    p,
    call: (cmd, input) => {
      s = operateReview(p, cmd, { expectedRevision: s.revision, ...input })
      return s
    },
    state: () => s,
  }
}
function assess(r) {
  r.call('freeze', {
    report: 'No actionable findings in examined scope.',
    isolation: 'fresh',
    context: ['source', 'requirements'],
  })
  r.call('reconcile', {
    report: 'No earlier findings.',
    receipt: 'history checked',
    unresolved: [],
  })
  r.call('assess', {
    assessment: 'CLEAN',
    report: 'Clean limited review.',
    currentSource: 'head1',
    currentRequirements: 'requirements1',
  })
}
it('freezes initial assessment before reconciliation and rejects unresolved clean verdict', () => {
  const r = review()
  expect(() => r.call('reconcile', { report: 'prior pass', receipt: 'r' })).toThrow()
  r.call('freeze', { report: 'independent report', isolation: 'fresh' })
  expect(() => r.call('freeze', { report: 'different' })).toThrow()
  r.call('reconcile', { report: 'old blocker persists', receipt: 'history', unresolved: ['bug'] })
  expect(() =>
    r.call('assess', {
      assessment: 'CLEAN',
      report: 'pass',
      currentSource: 'head1',
      currentRequirements: 'requirements1',
    }),
  ).toThrow(/remain/)
})
it('records unknown publication and permits receipt reconciliation, never blind retry', () => {
  const r = review()
  assess(r)
  r.call('prepare', {
    id: 'publish',
    authorityReceipt: 'explicit PR review',
    currentSource: 'head1',
    currentRequirements: 'requirements1',
    payload: {
      event: 'COMMENT',
      commit_id: 'head1',
      body: 'No findings. <!-- toolbox-review:review1 -->',
    },
  })
  r.call('delivery', {
    id: 'publish',
    action: 'dispatch',
    currentSource: 'head1',
    currentRequirements: 'requirements1',
  })
  r.call('delivery', { id: 'publish', action: 'unknown', reason: 'lost response' })
  expect(() => r.call('delivery', { id: 'publish', action: 'retry' })).toThrow()
  const s = r.call('delivery', {
    id: 'publish',
    action: 'published',
    providerId: '123',
    url: 'https://github.com/example/repo/pull/1#review-123',
    receipt: 'remote read-back',
    currentSource: 'head2',
    currentRequirements: 'requirements1',
  })
  expect(s.operations.publish.stale).toBe(true)
  expect(readReview(r.p).assessment).toBe('CLEAN')
})
it('requires publication authority, validated anchors and COMMENT-only payloads', () => {
  const r = review()
  assess(r)
  const input = {
    id: 'p',
    currentSource: 'head1',
    currentRequirements: 'requirements1',
    payload: { event: 'COMMENT', commit_id: 'head1', body: r.state().marker },
  }
  expect(() => r.call('prepare', input)).toThrow()
  expect(() =>
    r.call('prepare', {
      ...input,
      authorityReceipt: 'request',
      payload: { ...input.payload, event: 'APPROVE' },
    }),
  ).toThrow()
  expect(() =>
    r.call('prepare', {
      ...input,
      authorityReceipt: 'request',
      payload: { ...input.payload, comments: [{ path: 'x', line: 0, side: 'RIGHT' }] },
    }),
  ).toThrow()
})
it('declared companion graph is complete and acyclic', () => {
  const registry = new Map(SKILLS.map((s) => [s.slug, s]))
  const visit = (slug, path = []) => {
    expect(path).not.toContain(slug)
    for (const dep of registry.get(slug).required) {
      expect(registry.has(dep)).toBe(true)
      visit(dep, [...path, slug])
    }
  }
  for (const s of SKILLS) visit(s.slug)
})

it('canonical scope rejects dot-prefixed children and symlink aliases', () => {
  const p = program()
  const scope = join(p.p, 'checkout')
  mkdirSync(scope)
  mkdirSync(join(scope, '..cache'))
  symlinkSync(scope, join(p.p, 'alias'))
  p.call('unit', {
    action: 'add',
    id: 'owner',
    scope: [scope],
    inputFingerprint: 'a',
    criteria: ['correct'],
  })
  p.call('attempt', { action: 'start', unit: 'owner', id: 'owner-attempt', worker: 'w' })
  for (const [id, target] of [
    ['dot', join(scope, '..cache')],
    ['alias', join(p.p, 'alias')],
  ]) {
    p.call('unit', {
      action: 'add',
      id,
      scope: [target],
      inputFingerprint: id,
      criteria: ['correct'],
    })
    expect(() =>
      p.call('attempt', { action: 'start', unit: id, id: id + '-attempt', worker: 'w2' }),
    ).toThrow(/scope/)
  }
})
it('unknown publication cannot be bypassed by a new operation ID', () => {
  const r = review()
  assess(r)
  const input = {
    authorityReceipt: 'request',
    currentSource: 'head1',
    currentRequirements: 'requirements1',
    payload: { event: 'COMMENT', commit_id: 'head1', body: r.state().marker },
  }
  r.call('prepare', { id: 'first', ...input })
  r.call('delivery', {
    id: 'first',
    action: 'dispatch',
    currentSource: 'head1',
    currentRequirements: 'requirements1',
  })
  r.call('delivery', { id: 'first', action: 'unknown', reason: 'timeout' })
  expect(() => r.call('prepare', { id: 'second', ...input })).toThrow(/existing publication/)
})
it('invalid reconciliation does not poison the immutable report', () => {
  const r = review()
  r.call('freeze', { report: 'first report', isolation: 'fresh' })
  expect(() => r.call('reconcile', { report: 'history' })).toThrow()
  expect(
    r.call('reconcile', { report: 'history', receipt: 'read-back' }).reconciliation.receipt,
  ).toBe('read-back')
})
