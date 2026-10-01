# GitHub review delivery

<!-- source-of-truth: native GitHub review adapter and observation contracts -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-01 -->

Use this procedure for an explicitly invoked GitHub PR review. The helper owns frozen publication data; the host owns GitHub reads and the actual tool call. Local validation verifies supplied observations, not their provenance: capture actual provider evidence.

1. Read the current PR base/head, changed files and complete patches with GitHub MCP. Bind `source` to base/head/scope and `reviewedCommit` to the reviewed head. Fetch missing or truncated patches before anchoring; unavailable/binary patches cannot prove an inline coordinate.
2. Build one `payload` with `event: COMMENT`, `commit_id` equal to the reviewed head, a compact `body` containing the run marker, and `comments` for actionable findings. Each comment has `body`, repository-relative `path`, positive `line`, and `side: LEFT|RIGHT`. Include the finding's priority/title, trigger, impact and evidence in its body. Use the smallest useful range; add `start_line` and `start_side` only for a range on the same side and within one hunk. Use line coordinates, never diff positions.
3. Supply `anchorReceipt` with `target`, `source`, `commit_id`, `proof` (provider observation pointer), and `files: [{path, patch}]`. Patches are unified file hunks from the current PR, including context prefixes. The helper checks every coordinate and complete range against these hunks, including removed lines on LEFT and added lines on RIGHT. An invalid proposed anchor requires correction or more evidence. If a finding genuinely cannot be anchored by the provider, include its source permalink and the specific limitation in the review body; keep other findings inline. A clean review has no comments and needs no anchorReceipt.
4. Run `prepare` with publication authority and current source/requirements. Read `adapter --input <file>` with `{ "id": "<operation>" }` to retrieve the frozen MCP arguments. It maps `payload.event` to `action`, `body` to `review`, `comments` to `file_comments`, and preserves `commit_id`, path, side, line and optional range. It derives `repo_full_name` and `pr_number` from the target URL. This adapter supports `https://github.com/<owner>/<repo>/pull/<number>`; other providers/hosts require a verified adapter or an explicit local fallback.
5. Recheck PR identity and requirements, record `delivery/dispatch`, then submit those exact arguments to GitHub MCP `add_review_to_pr` once. All comments belong to that review. Keep COMMENT as the default; APPROVE and REQUEST_CHANGES use separately authorized tools. If a provider lacks inline capability, disclose that limitation before preparing a body-linked fallback. A rejection after dispatch is not permission to edit the frozen payload or blindly retry.
6. Read back the review and all comments belonging to its review ID (paginate fully). Normalize provider `state` to `event`, `html_url` to `url`, and `pull_request_review_id` to `review_id`. Supply `delivery/published` with string `providerId`, review `url`, current source/requirements, and the structured receipt below. The helper requires the exact review commit/body/COMMENT event and matching bodies, coordinates and ranges for every frozen comment. Preserve provider IDs and URLs as receipts. Submission success alone does not prove delivery. Failed or incomplete read-back leaves dispatch outstanding; record unknown and reconcile the same operation without submitting again.

```json
{
  "proof": "provider read-back observation pointer",
  "review": {
    "id": "123",
    "url": "https://github.com/owner/repo/pull/7#pullrequestreview-123",
    "commit_id": "reviewed SHA",
    "event": "COMMENT",
    "body": "exact frozen review body including marker"
  },
  "comments": [
    {
      "id": "456",
      "url": "https://github.com/owner/repo/pull/7#discussion_r456",
      "review_id": "123",
      "commit_id": "reviewed SHA",
      "body": "exact frozen finding body",
      "path": "src/example.ts",
      "line": 12,
      "side": "RIGHT"
    }
  ]
}
```

Include `start_line` and `start_side` in a ranged comment receipt. Treat provider null range fields as absent. Clean and fully body-linked fallback reviews use `comments: []` and still require review read-back. If HEAD changes after dispatch, retain the snapshot-bound publication and use the existing separate stale-notice operation. Return the verified review URL and inline comment URLs, disclose any fallback locations, and distinguish assessment from delivery.
