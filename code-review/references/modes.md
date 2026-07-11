# Review Modes

`pr` and `merge` diff/base → [shared.md](shared.md). Agent selection → [agent-selection.md](agent-selection.md).

---

## `pr`

**Diff:** [shared.md](shared.md) · **Depth:** Thorough

**Escalate to Full** if any: auth/payments/privacy/security; API/schema changes; **>10 code files or >600 code lines** touching shared modules/boundaries/persistence (`apps/`, `tspackages/` — **exclude** `docs/`, `.claude/skills/`, `AGENTS.md` from counts); **>20 code files or >1200 code lines** (same exclusion); weak/missing tests on risky paths. Record escalation in synthesis header per [output.md](output.md) § Status line (`Escalation: Stayed Thorough` or `Promoted to Full` + reason).

**Mixed PR** (product code + docs-only agent-workflow edits): default **Thorough** (4 agents) unless auth/security/API-schema paths hit.

**Thorough optional skip:** when diff has a clear single theme and no placement/boundary change, coordinator may omit `architecture` from optional slots — log in dispatch plan.

**Promoted to Full → fix-loop applies.** Deliver findings in chat per [output.md](output.md). See [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md).

**Overlay:** Reviewer-ready? Breaking changes, regressions, missing contract updates?

**Emphasis:** shared-util regression; OpenAPI client regen; missing tests; PR vs implementation match. Path boosts: query/cache → `correctness`; backend → `api`; UI → `ux`.

### Depth contract for `review vs main`

`review vs main` on a branch → mode `pr`, diff `main...HEAD` (whole branch). Depth is **calibrated**, not always Full.

| Condition | Depth | Council agents | Diff scope |
|-----------|-------|----------------|------------|
| Default (no escalation triggers below) | **Thorough** | 4 | Whole branch |
| Auth/security/API/schema; >10 files or >600 lines on shared paths; >20 files or >1200 lines; weak tests on risky paths | **Full** (escalated) | 5 | Whole branch |
| Fix-loop pass 2+ (prior Action findings in thread/PR) | **Full** (contextual re-review) | 5 | Whole branch |

Agent budget table: [agent-selection.md](agent-selection.md).

**Contextual filing ≠ shallow read.** On re-review, filing rules restrict what gets **appended** (no sibling blocks on closed themes except contradictions; improvements → Deferred tail). Council still runs **Full** on the **whole diff** — do not skip reading because prior synthesis marked themes fixed. See [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md) § Contextual Full re-review.

**Depth regression:** If escalation triggers match Full but synthesis says Thorough, treat as incomplete depth — re-run at Full or record why triggers did not apply.

**Merge gate:** Exit contextual Full re-review with no merge-blockers — not "zero findings on first Full baseline." See [review-fix-loop.md](../../../../docs/developer/review-fix-loop.md) § Merge-ready (human gate).

**Default filing:** merge-blockers only — [merge-blockers.md](merge-blockers.md). Say `include improvements` for polish, tests, refactor.

---

## `commit`

**Diff:** `git show HEAD` or `git show <sha>` · **Depth:** Standard

**Overlay:** Atomic commit? Message matches diff? Stray debug/unrelated files?

**Emphasis:** atomicity, message accuracy, `console.log` / `.only` / stray files.

---

## `unstaged`

**Diff:** `git diff` · **Depth:** Standard

**Overlay:** WIP-safe to continue? Half-finished paths, session-breaking logic?

**Emphasis:** WIP blockers, resume-hostile structure — hygiene via [ai-drift.md](../../../../docs/developer/ai-drift.md) § Review lens.

---

## `staged`

**Diff:** `git diff --cached` · **Depth:** Standard

**Overlay:** Commit-ready? Accidental files, missing tests, CI lint blockers?

**Emphasis:** accidental `.env`/artifacts; staged logic tests; `generate-clients` if schema changed; `validate:changed <path>` — [validation.md](../../../../docs/developer/validation.md); [ai-drift.md](../../../../docs/developer/ai-drift.md) § Review lens.

---

## `merge`

**Diff:** [shared.md](shared.md) base + `git diff <base>...<head>` · **Depth:** Thorough

**Overlay:** Semantic conflicts beyond git merge? Feature complete vs spec?

**Emphasis:** integration correctness; migration ordering; duplicate parallel logic.

---

## `implementation`

**Diff:** `git diff <base> -- <paths>` + read files holistically · **Depth:** Thorough (leans Full)

**Overlay:** Right design, placement, naming for the domain — not just the delta.

**Emphasis:** architecture fit, abstraction level, module placement. Default base `main`; ask if paths unclear.
