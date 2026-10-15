# PR to merge-ready

<!-- source-of-truth: workflow playbook for turning local work into a merge-ready pull request -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**You own** the change from a dirty checkout to a merge-ready PR. Merging stays with the user.

1. Group and commit ready work with create-bounded-commits. Leave unrelated work untouched.
2. Review the commits with code-review before publishing.
3. Push and open the PR only when the user's git rules allow it for this branch. Otherwise ask.
4. Drive the PR with babysit-pr until its verdict is `READY` or `BLOCKED`.

**Reply contract:** commits made, review outcome, PR link, merge-readiness verdict at the head SHA, and what is left for the user.
