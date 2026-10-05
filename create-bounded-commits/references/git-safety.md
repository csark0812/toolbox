# Git candidate and commit safety

Use this protocol for proposing candidates and for executing an approved batch. Never work in another checkout or move the user's current branch.

## Capture and candidate commits

1. Confirm the repository root, current worktree, attached branch, expected HEAD, and current index. Capture staged and unstaged tracked diffs separately, plus untracked path/content fingerprints. Stop before planning execution if HEAD is detached, conflicts exist, or Git reports an operation in progress.
2. Keep the original checkout and index untouched while preparing candidates. Use a temporary detached worktree rooted at captured HEAD. Apply only proposed groups, in dependency order, to that candidate. For mixed files, verify the included and excluded hunks against the captured patch. Do not copy deferred changes into the candidate just to make checks pass.
3. Run applicable repository-required checks and focused tests in the candidate. Record the commands, candidate state, exit statuses, and results for each group. If isolated candidate creation fails, required checks are pending, or a group fails, defer it and all dependent groups; do not fix it. Parsing a proposed file or checking patch whitespace alone does not establish candidate validation. A deferred proposal may still be shown for discussion, but identify every blocker and keep it out of the ready-to-commit batch.
4. Only after user approval and an owner safe point, recheck branch/HEAD, index tree, tracked diffs, untracked fingerprints, and approved patch content. Any unexpected change invalidates affected approval. Refresh the candidate and show a revised proposal before continuing.

## Preserve staged work when advancing the branch

The user's staged index can contain both approved and deferred hunks. Never replace it with the new HEAD tree or stage the whole working tree.

1. Before changing the branch, construct and verify the final candidate commits. Copy the captured index to a temporary file and run the skill's `scripts/reconcile-index.mjs` with the old HEAD, final candidate HEAD, captured-index copy, and a new temporary output path. It uses Git's content-aware three-way merge to carry the captured index tree onto the candidate, deduplicate approved changes already present in commits, and retain other staged changes. Inspect and verify the resulting tree before execution.
2. If reconciliation has conflicts, cannot be verified, or the real index differs from the captured index, do not advance the branch. Report the exact blocker and preserve the original checkout.
3. Require the checked-out branch ref still points at captured HEAD. Advance it with an expected-old-value compare-and-swap; do not reset, rebase, force-update, stash, or switch branches.
4. Install the precomputed reconciled index atomically only after confirming the candidate commit chain and expected ref update. If any failure leaves branch/index state uncertain, stop and report the observed state; do not attempt an automatic rewrite or rollback that could overwrite user work.
5. Verify each commit parent, message, and tree against the approved candidate. Compare remaining staged and unstaged diffs and untracked fingerprints with the expected preserved state. Report any mismatch before continuing to another group.

Hooks must run normally in the isolated candidate. If a hook changes approved content, stops, or fails, do not bypass it or commit its changed output: update validation, defer the affected groups, and request fresh approval for changed content.
