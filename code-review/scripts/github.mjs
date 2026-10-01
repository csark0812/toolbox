// Pure GitHub boundary: host tools supply current diffs and remote read-back evidence.
const reject = (message) => {
  throw new Error(message)
}
const text = (value) => typeof value === 'string' && value.trim()
const coordinates = ['path', 'line', 'side', 'start_line', 'start_side']
export function validateGithubAnchors(payload, state, receipt) {
  const comments = payload.comments ?? []
  if (!Array.isArray(comments)) reject('Invalid comments list')
  if (!comments.length) return
  if (
    !receipt ||
    !text(receipt.proof) ||
    receipt.target !== state.target ||
    receipt.source !== state.source ||
    receipt.commit_id !== state.reviewedCommit ||
    !Array.isArray(receipt.files)
  )
    reject('Current-diff anchor validation receipt required')
  const seen = new Set()
  for (const comment of comments) {
    if (
      !text(comment.body) ||
      !text(comment.path) ||
      comment.path.startsWith('/') ||
      comment.path.includes('\\') ||
      comment.path.split('/').some((p) => !p || p === '.' || p === '..') ||
      !Number.isInteger(comment.line) ||
      comment.line < 1 ||
      !['LEFT', 'RIGHT'].includes(comment.side) ||
      comment.position !== undefined
    )
      reject('Invalid diff coordinate or comment body')
    const start = comment.start_line ?? comment.line
    if (
      !Number.isInteger(start) ||
      start < 1 ||
      start > comment.line ||
      (comment.start_line !== undefined &&
        (start === comment.line || comment.start_side !== comment.side)) ||
      (comment.start_line === undefined && comment.start_side !== undefined)
    )
      reject('Invalid diff range')
    const key = JSON.stringify(comment)
    if (seen.has(key)) reject('Duplicate inline comment')
    seen.add(key)
    const files = receipt.files.filter((f) => f.path === comment.path)
    if (files.length !== 1 || !text(files[0].patch))
      reject('Missing or ambiguous current diff file')
    let oldLine,
      newLine,
      oldRemaining = 0,
      newRemaining = 0,
      lines = new Set(),
      anchored = false
    const finish = () => {
      if (oldRemaining || newRemaining) reject('Incomplete diff hunk')
      let covered = true
      for (let line = start; line <= comment.line; line++) if (!lines.has(line)) covered = false
      anchored ||= covered
    }
    for (const row of files[0].patch.split('\n')) {
      const hunk = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(row)
      if (hunk) {
        if (oldLine !== undefined) finish()
        oldLine = Number(hunk[1])
        newLine = Number(hunk[3])
        oldRemaining = Number(hunk[2] ?? 1)
        newRemaining = Number(hunk[4] ?? 1)
        lines = new Set()
      } else if (oldLine !== undefined && (oldRemaining || newRemaining)) {
        if (row.startsWith('\\')) continue
        const prefix = row[0]
        if (![' ', '-', '+'].includes(prefix)) reject('Malformed diff hunk')
        if (prefix !== '+') {
          if (--oldRemaining < 0) reject('Malformed diff hunk')
          if (comment.side === 'LEFT') lines.add(oldLine)
          oldLine++
        }
        if (prefix !== '-') {
          if (--newRemaining < 0) reject('Malformed diff hunk')
          if (comment.side === 'RIGHT') lines.add(newLine)
          newLine++
        }
      }
    }
    if (oldLine !== undefined) finish()
    if (!anchored) reject('Anchor outside current diff hunk')
  }
}
export function githubReviewArguments(target, payload) {
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/pull\/(\d+)\/?$/.exec(target)
  if (!match) return null
  return {
    repo_full_name: match[1],
    pr_number: Number(match[2]),
    action: payload.event,
    commit_id: payload.commit_id,
    review: payload.body,
    file_comments: (payload.comments ?? []).map((comment) =>
      Object.fromEntries(
        ['body', ...coordinates]
          .filter((key) => comment[key] !== undefined)
          .map((key) => [key, comment[key]]),
      ),
    ),
  }
}
export function validateGithubReceipt(payload, input) {
  const receipt = input.receipt
  const review = receipt?.review
  if (
    !text(receipt?.proof) ||
    String(review?.id) !== input.providerId ||
    review?.url !== input.url ||
    review?.commit_id !== payload.commit_id ||
    review?.body !== payload.body ||
    review?.event !== 'COMMENT' ||
    !Array.isArray(receipt.comments)
  )
    reject('Review read-back does not match frozen publication')
  const remaining = [...receipt.comments]
  const ids = new Set()
  for (const comment of remaining) {
    if (
      !text(String(comment.id ?? '')) ||
      !text(comment.url) ||
      String(comment.review_id) !== input.providerId ||
      comment.commit_id !== payload.commit_id ||
      ids.has(String(comment.id))
    )
      reject('Invalid inline comment receipt')
    ids.add(String(comment.id))
  }
  for (const expected of payload.comments ?? []) {
    const index = remaining.findIndex(
      (actual) =>
        actual.body === expected.body &&
        coordinates.every((key) => (actual[key] ?? undefined) === expected[key]),
    )
    if (index < 0) reject('Missing matching inline comment read-back')
    remaining.splice(index, 1)
  }
  if (remaining.length) reject('Unexpected inline comment read-back')
  return receipt
}
