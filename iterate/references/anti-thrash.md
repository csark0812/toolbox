# Anti-thrash preflight

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Iterate coordinator vocabulary** — thrash signals and pass classification when you reopen themes across blind passes. Diff review orchestration lives in [`subagents`](../../subagents/SKILL.md). Diff review **how-to** lives in [`code-review`](../../code-review/SKILL.md).

Run **before synthesis** on any pass when prior Action findings can exist. Themes → [fix-loop-ledger.md](fix-loop-ledger.md). Output markers → [output.md](output.md).

1. **Detect repeated review** — MUST treat as repeated when any is true:
   - Same branch/thread as a prior `Review · …` pass, or the user asked to re-review after fixes.
   - Bare prompts (`review`, `review vs main`, `check the PR`) with no prior themes in the message **and** recoverable themes / same-hotspot commit-stack from archaeology.
   - Same branch with recent review-fix commits after an Action pass.
   - **Same-hotspot commit-stack thrash** ([fix-loop-ledger.md](fix-loop-ledger.md) § Predicate glossary): tip window (last 8 commits or since last broad Action) has ≥2 commits that share ≥1 **non-noise** path. That path appears in ≥2 of those commits (back-and-forth recurrence). One-hop shared file alone is not enough. There is **no** ≥3 same-subsystem `fix:` refuse rule.
   - Prior `Review ·` synthesis, `Theme:` lines, or PR body themes.
   - Leftover `_agent/review/REVIEW_LEDGER.md` if present: **ignore for closure state**. Never treat `closed` columns as authority. Delete on green ([fix-loop-ledger.md](fix-loop-ledger.md) § Ledger policy).
2. **Reconstruct themes** — stable-theme table from, in order ([fix-loop-ledger.md](fix-loop-ledger.md)):
   1. In-message synthesis / `Theme:` lines.
   2. PR body (if present).
   3. Commit messages with `Theme:` / `theme_id` or `Review ·`.
   4. Provisional **contract-class** slug from hotspot archaeology when 1–3 miss ([fix-loop-ledger.md](fix-loop-ledger.md) § Contract-class catalog).
   5. Leftover ledger file can supply **identity labels only** if present — never closure state. Prefer Theme:/slug/collapse.
3. **Classify** (`Pass class:` in header):
   - `first-baseline` — **only** when no prior Action findings, no recoverable Theme:/Continuity, **and** no same-hotspot commit-stack thrash. MUST NOT emit `first-baseline` when step 1 detects repeated review or same-hotspot thrash.
   - `fix-implementation` — user asked to implement findings (not re-review yet).
   - `closure-re-review` — re-review after fixes. Recoverable themes and/or same-hotspot thrash. Tip bound to prior themes / sweep surfaces. **Default** when step 1 detects repeated review or thrash.
   - `new-scope-review` — scope **materially** outside reconstructed themes (new subsystem/contract, not an adjacent edge of an open family), or archaeology fails to bound themes.
4. **Hard stop before Task/council** — see below. Complete before step 5 when escalation is under consideration.
5. **Choose lane** — `closure-re-review` → targeted re-pass on open themes and matrix rows. Whole-surface size MUST NOT alone widen scope.
   - **Thrash / same-hotspot stack / sibling edge of an open family:** stay targeted. Header MUST include `Thrash: inventory-required`. Complete same-invariant sweep ([fix-loop-ledger.md](fix-loop-ledger.md) § Same-invariant sweep + § Sweep quality).
   - **Full revisit** only when the user explicitly asks or pass class is `new-scope-review` (material new scope). Size alone never widens scope.
6. **Thrash signal** — two+ Action blockers same family, reopened `theme_id`, or same-hotspot micro-fix trail → same-invariant inventory under one theme. No symptom-hunting. High-dimensional contract themes → matrix checklist before `closed`. Sibling mint of a new `theme_id` for the same hotspot/class is a protocol error.
7. **Over-fire** — true first Action, single fix commit, or tip window with **no** recurring non-noise hotspot path → `first-baseline` **allowed**.
8. **Green cleanup** — exit gate passes → delete leftover review ledger file if present. **Never write** `_agent/review/REVIEW_LEDGER.md` during the loop.

## Hard stop (before Task / council)

**Mandatory before any Task/Subagent or council spawn** on branch/PR/merge-readiness reviews — including bare `review` / `review vs main` in a new chat. Soft narration of anti-thrash without this gate is incomplete.

### Trigger (either is enough)

- **Same-hotspot micro-fix trail:** tip window meets [fix-loop-ledger.md](fix-loop-ledger.md) § Predicate glossary **Same-hotspot** (path recurrence across ≥2 tip commits). This includes `fix(…):` / review-fix style after a broad Action pass.
- **Recoverable themes:** any `Theme:` / `theme_id` / prior `Review ·` / Continuity identity recovered from message, PR body, commit messages, transcript archaeology, or provisional contract-class slug (step 2).

Empty in-message themes / empty PR Continuity alone MUST NOT clear the trigger when tip or other channels still fire. Missing chat context alone MUST NOT imply `first-baseline`.

### Forced pass class

When a trigger fires:

| Allowed                                                                                                                                           | Forbidden                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `closure-re-review` (default)                                                                                                                     | `first-baseline`                                                                          |
| `new-scope-review` **only** with a written bound: which surfaces are new, why tip hotspots are out of prior themes, and what stays closure-scoped | Size, security attention, or “no themes in this thread” as `first-baseline` justification |

Do **not** spawn Task/council until `Pass class` is set to an allowed value. Record the archaeology evidence below in the header and/or dispatch plan.

### Archaeology evidence (paste into plan / header)

Run tip archaeology before classifying when step 1 can apply (bare prompt, empty PR Continuity, or unknown prior pass):

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

**Efficiency:** stay targeted on open themes. Spawn another blind pass only per [protocol.md](protocol.md).
