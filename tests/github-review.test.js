import { describe, it, expect } from 'vitest'
import {
  validateGithubAnchors,
  githubReviewArguments,
  validateGithubReceipt,
} from '../code-review/scripts/github.mjs'
const state = {
  target: 'https://github.com/example/repo/pull/7',
  source: 'base:head:scope',
  reviewedCommit: 'head',
}
const comment = { body: '[P1] Reachable defect', path: 'src/a.js', line: 12, side: 'RIGHT' }
const payload = {
  event: 'COMMENT',
  commit_id: 'head',
  body: 'One finding. <!-- toolbox-review:r -->',
  comments: [comment],
}
const anchors = {
  ...state,
  commit_id: 'head',
  proof: 'PR files read at head',
  files: [
    {
      path: 'src/a.js',
      patch:
        '@@ -10,3 +10,4 @@\n context\n-old\n+new\n+added\n context\n@@ -30 +31 @@\n-last\n+last',
    },
  ],
}
const receipt = () => ({
  proof: 'Review and all review comments read back',
  review: {
    id: '42',
    url: 'https://github.com/example/repo/pull/7#pullrequestreview-42',
    commit_id: 'head',
    body: payload.body,
    event: 'COMMENT',
  },
  comments: [
    {
      ...comment,
      id: '43',
      review_id: '42',
      commit_id: 'head',
      url: 'https://github.com/example/repo/pull/7#discussion_r43',
    },
  ],
})
const publication = () => ({ providerId: '42', url: receipt().review.url, receipt: receipt() })
describe('GitHub review publication boundary', () => {
  it('accepts added, deleted, context and same-hunk range anchors', () => {
    for (const anchor of [
      comment,
      { ...comment, line: 11, side: 'LEFT' },
      { ...comment, line: 10 },
      { ...comment, start_line: 11, start_side: 'RIGHT', line: 13 },
    ]) {
      expect(() =>
        validateGithubAnchors({ ...payload, comments: [anchor] }, state, anchors),
      ).not.toThrow()
    }
  })
  it.each([
    { path: '../a' },
    { path: '/a' },
    { path: 'src/missing.js' },
    { line: 0 },
    { line: 30 },
    { side: 'OTHER' },
    { line: 14 },
    { body: '' },
    { position: 2 },
    { start_line: 9, start_side: 'RIGHT' },
    { start_line: 13, start_side: 'RIGHT' },
    { start_line: 11, start_side: 'LEFT' },
    { start_side: 'RIGHT' },
    { start_line: 12, start_side: 'RIGHT' },
    { line: 31, start_line: 12, start_side: 'RIGHT' },
  ])('rejects invalid or unavailable anchor %j', (change) => {
    expect(() =>
      validateGithubAnchors({ ...payload, comments: [{ ...comment, ...change }] }, state, anchors),
    ).toThrow()
  })
  it('rejects stale, unstructured, missing, and truncated diff observations', () => {
    for (const observation of [
      undefined,
      'checked',
      { ...anchors, source: 'old' },
      { ...anchors, commit_id: 'old' },
      { ...anchors, target: 'other' },
      {
        ...anchors,
        files: [{ path: comment.path, patch: '@@ -10,3 +10,4 @@\n context\n-old\n+new\n+added' }],
      },
    ]) {
      expect(() => validateGithubAnchors(payload, state, observation)).toThrow()
    }
  })
  it('maps frozen comments to the official GitHub MCP pending-review sequence', () => {
    const ranged = { ...comment, start_line: 11, start_side: 'RIGHT' }
    const pr = { owner: 'example', repo: 'repo', pullNumber: 7 }
    const args = githubReviewArguments(state.target, { ...payload, comments: [ranged] })
    expect(args.calls).toEqual([
      {
        tool: 'pull_request_review_write',
        arguments: { method: 'create', ...pr, commitID: 'head' },
      },
      {
        tool: 'add_comment_to_pending_review',
        arguments: {
          ...pr,
          body: comment.body,
          path: comment.path,
          line: comment.line,
          side: comment.side,
          startLine: 11,
          startSide: 'RIGHT',
          subjectType: 'LINE',
        },
      },
      {
        tool: 'pull_request_review_write',
        arguments: { method: 'submit_pending', ...pr, event: 'COMMENT', body: payload.body },
      },
    ])
    expect(args.rest).toEqual({
      endpoint: 'POST /repos/example/repo/pulls/7/reviews',
      body: { commit_id: 'head', event: 'COMMENT', body: payload.body, comments: [ranged] },
    })
  })
  it('supports clean publication without anchor evidence or inline comments', () => {
    const clean = { ...payload, comments: [] }
    expect(() => validateGithubAnchors(clean, state)).not.toThrow()
    expect(
      githubReviewArguments(state.target, clean).calls.map((call) => call.arguments.method),
    ).toEqual(['create', 'submit_pending'])
    const input = publication()
    input.receipt.comments = []
    expect(() => validateGithubReceipt(clean, input)).not.toThrow()
  })
  it('requires the review and each inline comment to match remote read-back', () => {
    expect(() => validateGithubReceipt(payload, publication())).not.toThrow()
    for (const mutate of [
      (r) => {
        r.review.commit_id = 'old'
      },
      (r) => {
        r.review.body = 'different'
      },
      (r) => {
        r.review.event = 'APPROVE'
      },
      (r) => {
        r.comments = []
      },
      (r) => {
        r.comments[0].review_id = 'other'
      },
      (r) => {
        r.comments[0].line = 13
      },
      (r) => {
        r.comments[0].commit_id = 'old'
      },
      (r) => {
        r.comments.push({ ...r.comments[0] })
      },
    ]) {
      const input = publication()
      mutate(input.receipt)
      expect(() => validateGithubReceipt(payload, input)).toThrow()
    }
  })
})
