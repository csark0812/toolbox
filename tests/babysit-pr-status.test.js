import { describe, expect, it } from 'vitest'
import { decide } from '../babysit-pr/scripts/status.mjs'

const open = { state: 'OPEN', isDraft: false, mergeable: 'MERGEABLE', reviewDecision: 'APPROVED' }
const pass = { name: 'test', bucket: 'pass' }

describe('babysit-pr status policy', () => {
  it('is ready only when open, mergeable, resolved and every check passed', () => {
    expect(decide({ pr: open, checks: [pass], threads: [] })).toEqual({
      verdict: 'READY',
      reasons: [],
    })
  })

  it('blocks closed and draft PRs before anything else', () => {
    expect(decide({ pr: { ...open, state: 'MERGED' }, checks: [], threads: [] }).verdict).toBe(
      'BLOCKED',
    )
    expect(decide({ pr: { ...open, isDraft: true }, checks: [pass], threads: [] }).verdict).toBe(
      'BLOCKED',
    )
  })

  it('orders work as conflicts, then threads, then CI', () => {
    const failing = [{ name: 'test', bucket: 'fail' }]
    const thread = [{ isResolved: false, isOutdated: false, path: 'src/a.mjs' }]
    expect(
      decide({ pr: { ...open, mergeable: 'CONFLICTING' }, checks: failing, threads: thread })
        .verdict,
    ).toBe('ACTION:conflict')
    expect(decide({ pr: open, checks: failing, threads: thread }).verdict).toBe('ACTION:threads')
    expect(decide({ pr: open, checks: failing, threads: [] }).verdict).toBe('ACTION:ci')
  })

  it('treats a dirty merge state as a conflict even before mergeable is computed', () => {
    const pr = { ...open, mergeable: 'UNKNOWN', mergeStateStatus: 'DIRTY' }
    expect(decide({ pr, checks: [{ name: 'test', bucket: 'fail' }], threads: [] }).verdict).toBe(
      'ACTION:conflict',
    )
  })

  it('ignores resolved and outdated threads', () => {
    const threads = [
      { isResolved: true, isOutdated: false },
      { isResolved: false, isOutdated: true },
    ]
    expect(decide({ pr: open, checks: [pass], threads }).verdict).toBe('READY')
  })

  it('waits on the reviewer for an open thread whose latest comment answers its opener', () => {
    const by = (...logins) => ({ nodes: logins.map((login) => ({ author: { login } })) })
    const replied = {
      isResolved: false,
      isOutdated: false,
      path: 'src/a.mjs',
      comments: by('dana', 'sam'),
    }
    expect(decide({ pr: open, checks: [pass], threads: [replied] })).toEqual({
      verdict: 'WAITING',
      reasons: ['Replied thread on src/a.mjs awaits the reviewer'],
    })
    const reopened = { ...replied, comments: by('dana', 'sam', 'dana') }
    expect(decide({ pr: open, checks: [pass], threads: [reopened] }).verdict).toBe('ACTION:threads')
  })

  it('never treats cancelled or skipped checks as green', () => {
    for (const bucket of ['cancel', 'skipping'])
      expect(decide({ pr: open, checks: [pass, { name: 'e2e', bucket }], threads: [] })).toEqual({
        verdict: 'ACTION:ci',
        reasons: [`Incomplete check (${bucket}): e2e`],
      })
  })

  it('waits on pending checks, missing checks, unknown mergeability and requested changes', () => {
    expect(
      decide({ pr: open, checks: [{ name: 'test', bucket: 'pending' }], threads: [] }).verdict,
    ).toBe('WAITING')
    expect(decide({ pr: open, checks: [], threads: [] }).reasons).toContain(
      'No checks reported yet',
    )
    expect(
      decide({ pr: { ...open, mergeable: 'UNKNOWN' }, checks: [pass], threads: [] }).verdict,
    ).toBe('WAITING')
    expect(
      decide({ pr: { ...open, reviewDecision: 'CHANGES_REQUESTED' }, checks: [pass], threads: [] })
        .verdict,
    ).toBe('WAITING')
  })
})
