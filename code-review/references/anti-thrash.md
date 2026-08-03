# Anti-thrash preflight

<!-- doc-meta: owner=eng | last-reviewed=2026-08-03 -->

Run **before synthesis** — and **before any Task/council spawn** — on any re-review or merge-readiness ask when prior Action findings **may** exist — **any** source adapter ([sources.md](sources.md)), not only branch/PR. Bare `review vs main` in a new chat is a continuity check, not an automatic fresh baseline.

Depth lane → [surfaces.md](surfaces.md) § Re-review. Themes → [fix-loop-ledger.md](fix-loop-ledger.md). Continuity → [output.md](output.md). Predicate glossary → [fix-loop-ledger.md](fix-loop-ledger.md) § Predicate glossary.

1. **Detect repeated review** — MUST treat as repeated when any is true:
   - Same branch/thread as a prior `Review · …` pass, or user asked to re-review after fixes.
   - Bare prompts (`review`, `review vs main`, `check the PR`) with no prior themes in the message **and** recoverable themes / same-hotspot commit-stack from archaeology.
   - Same branch with recent review-fix commits after an Action pass.
   - **Same-hotspot commit-stack thrash** ([fix-loop-ledger.md](fix-loop-ledger.md) § Predicate glossary): tip window (last 8 commits or since last broad Action) has ≥2 commits that share ≥1 **non-noise** path **and** that path appears in ≥2 of those commits (back-and-forth recurrence). One-hop shared file alone is not enough. There is **no** ≥3 same-subsystem `fix:` refuse rule.
   - Prior `Review ·` synthesis, `Theme:` lines, or PR body themes.
   - Leftover `_agent/review/REVIEW_LEDGER.md` if present: **ignore for closure state**; never treat `closed` columns as authority; delete on green ([fix-loop-ledger.md](fix-loop-ledger.md) § Ledger policy).
2. **Reconstruct themes** — stable-theme table from, in order ([fix-loop-ledger.md](fix-loop-ledger.md)):
   1. In-message synthesis / `Theme:` lines.
   2. PR body (if present).
   3. Commit messages with `Theme:` / `theme_id` or `Review ·`.
   4. Provisional **contract-class** slug from hotspot archaeology when 1–3 miss ([fix-loop-ledger.md](fix-loop-ledger.md) § Contract-class catalog).
   5. Leftover ledger file may supply **identity labels only** if present — never closure state. Prefer Theme:/slug/collapse.
3. **Classify** (`Pass class:` in header):
   - `first-baseline` — **only** when no prior Action findings, no recoverable Theme:/Continuity, **and** no same-hotspot commit-stack thrash. MUST NOT emit `first-baseline` when step 1 detects repeated review or same-hotspot thrash.
   - `fix-implementation` — user asked to implement findings (not re-review yet).
   - `closure-re-review` — re-review after fixes; recoverable themes and/or same-hotspot thrash; tip bound to prior themes / sweep surfaces. **Default** when step 1 detects repeated review or thrash.
   - `new-scope-review` — scope **materially** outside reconstructed themes (new subsystem/contract, not an adjacent edge of an open family), or archaeology fails to bound themes.
4. **Hard stop before Task/council** — see below. Complete before step 5 when escalation is considered.
5. **Choose lane** — `closure-re-review` → **primary** `Pass: targeted contextual` ([surfaces.md](surfaces.md)). Whole-surface size MUST NOT alone promote to council or Full.
   - **Thrash / same-hotspot stack / sibling edge of an open family:** stay targeted; header MUST include `Thrash: inventory-required`; complete same-invariant Sweep ([fix-loop-ledger.md](fix-loop-ledger.md) § Same-invariant sweep + § Sweep quality). **Never** auto-Full on thrash.
   - **Full contextual** only when the user explicitly asks Full / whole-branch revisit, **or** pass class is `new-scope-review` (material new scope). Size alone never Full. See [surfaces.md](surfaces.md) § Full contextual.
6. **Thrash signal** — two+ Action blockers same family, reopened `theme_id`, or same-hotspot micro-fix trail → primary same-invariant inventory under one theme; no symptom-hunting council. High-dimensional contract themes → matrix checklist before `closed`. Sibling mint of a new `theme_id` for the same hotspot/class is a protocol error.
7. **Over-fire** — true first Action, single fix commit, or tip window with **no** recurring non-noise hotspot path → `first-baseline` **allowed**.
8. **Green cleanup** — exit gate passes → delete leftover review ledger file if present. **Never write** `_agent/review/REVIEW_LEDGER.md` during the loop.

## Hard stop (before Task / council)

**Mandatory before any Task/Subagent or council spawn** on branch/PR/merge-readiness reviews — including bare `review` / `review vs main` in a new chat. Soft narration of anti-thrash without this gate is incomplete.

### Trigger (either is enough)

- **Same-hotspot micro-fix trail:** tip window meets [fix-loop-ledger.md](fix-loop-ledger.md) § Predicate glossary **Same-hotspot** (path recurrence across ≥2 tip commits), especially `fix(…):` / review-fix style after a broad Action pass.
- **Recoverable themes:** any `Theme:` / `theme_id` / prior `Review ·` / Continuity identity recovered from message, PR body, commit messages, transcript archaeology, or provisional contract-class slug (step 2).

Empty in-message themes / empty PR Continuity alone MUST NOT clear the trigger when tip or other channels still fire. Missing chat context alone MUST NOT imply `first-baseline`.

### Forced pass class

When a trigger fires:

| Allowed                                                                                                                                           | Forbidden                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `closure-re-review` (default)                                                                                                                     | `first-baseline`                                                                          |
| `new-scope-review` **only** with a written bound: which surfaces are new, why tip hotspots are out of prior themes, and what stays closure-scoped | Size, security attention, or “no themes in this thread” as `first-baseline` justification |

Do **not** spawn Task/council until `Pass class` is set to an allowed value and the archaeology evidence below is recorded (header and/or dispatch plan).

### Archaeology evidence (paste into plan / header)

Run tip archaeology before classifying when step 1 may apply (bare prompt, empty PR Continuity, or unknown prior pass):

```bash
git log --oneline --stat -n 12
# plus, when a PR exists: gh pr view --json body -q .body  (or equivalent) and scan for Theme: / Continuity
```

Record at least:

- Tip commits that form the same-hotspot trail (or “none”).
- Recurring non-noise hotspot paths.
- Recovered `Theme:` / `theme_id` / contract-class slug list (or provisional ids).
- Chosen `Pass class:` + one-line reason (`same-hotspot` / `Theme: recovery` / `new-scope bound: …`).

---

**Efficiency:** re-review on Broad surface still uses targeted primary closure; optional Quick (1) specialist only if primary cannot settle hotspot ([escalation.md](escalation.md)).
