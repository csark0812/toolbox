# Anti-thrash preflight

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Run **before synthesis** on any re-review or merge-readiness ask when prior Action findings **may** exist — **any** source adapter ([sources.md](sources.md)), not only branch/PR. Bare `review vs main` in a new chat is a continuity check, not an automatic fresh baseline.

Depth lane → [surfaces.md](surfaces.md) § Re-review. Themes → [fix-loop-ledger.md](fix-loop-ledger.md). Continuity → [output.md](output.md).

1. **Detect repeated review** — MUST treat as repeated when any is true:
   - Same branch/thread as a prior `Review · …` pass, or user asked to re-review after fixes.
   - Bare prompts (`review`, `review vs main`, `check the PR`) with no prior themes in the message.
   - Same branch with recent review-fix commits after an Action pass.
   - **Commit-stack thrash:** tip history shows **≥2** consecutive commits mostly touching the same hotspot(s) after a broad Action pass.
   - Prior `Review ·` synthesis, `Theme:` lines, PR body themes, or old leftover `_agent/review/REVIEW_LEDGER.md` (read once if present).
2. **Reconstruct themes** — stable-theme table from, in order ([fix-loop-ledger.md](fix-loop-ledger.md)):
   1. In-message synthesis / `Theme:` lines.
   2. PR body (if present).
   3. Commit messages with `theme_id` or `Review ·`.
   4. Legacy leftover ledger file (once).
   5. Provisional themes from `git log` + hotspot archaeology when 1–4 miss.
3. **Classify** (`Pass class:` in header):
   - `first-baseline` — no prior Action findings and no recoverable themes / commit-stack signal.
   - `fix-implementation` — user asked to implement findings (not re-review yet).
   - `closure-re-review` — re-review after fixes; recoverable themes and/or commit-stack thrash; tip only touches prior themes / sweep surfaces. **Default** when step 1 detects repeated review.
   - `new-scope-review` — scope materially expanded outside reconstructed themes, or archaeology fails to bound themes.
4. **Choose lane** — `closure-re-review` → **primary** targeted closure ([surfaces.md](surfaces.md)); whole-surface size MUST NOT alone promote to council. Promote to Full contextual only when [fix-loop-ledger.md](fix-loop-ledger.md) / [surfaces.md](surfaces.md) lists qualifying reasons **other than** size alone.
5. **Thrash signal** — two+ Action blockers same family, reopened `theme_id`, or micro-fix hotspot trail → primary same-invariant sweep; no symptom-hunting council. High-dimensional contract themes → matrix checklist before `closed`.
6. **Green cleanup** — exit gate passes → delete leftover review ledger file if present.

**Efficiency:** re-review on Broad surface still uses targeted primary closure; optional Quick (1) specialist only if primary cannot settle hotspot ([escalation.md](escalation.md)).
