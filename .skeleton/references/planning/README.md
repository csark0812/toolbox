# Planning playbooks (shared references)

**Portable soft-default (consumer remaps apply):** Toolbox ships Linear / `docs/prds/` baselines for consumers with **no** remap. **STOP:** If the consumer remaps this path via customize (`shared-agent-references` / docs), **do not execute the steps below** — open the consumer planning SSOT only. Do not treat `docs/prds/` or path examples below as authoritative when remapped.

Execution planning and **completeness verify** live here as **reference docs**, not as a standalone invocable skill. Use the right **entry skill**, then open the matching playbook.

## Files

| File | Purpose | Usual entry |
|------|---------|-------------|
| [build.md](build.md) | Guided planning from scratch → CreatePlan / PRD / Linear issues | **crystallize** or **grill** (after dialogue), or directly when intent is already clear |
| [verify.md](verify.md) | Three-axis completeness pass on an existing plan / PRD / issues | **second-opinion** (verify stance) |
| [plan-format.md](plan-format.md) | CreatePlan template + self-check | After `build.md` when output is todos |
| [prd-format.md](prd-format.md) | PRD template for `docs/prds/` | After `build.md` when output is a PRD |
| [issues-format.md](issues-format.md) | Vertical-slice Linear issues | After `build.md` when output is issues |

**Fresh read of someone else’s plan** (premise pass + critique, not the axis checklist) → **second-opinion** skill, [second-opinion reference](../../../second-opinion/references/second-opinion.md).

## Completeness axes

All three axes run on every plan; weighting shifts by plan type (used in **build** and **verify**).

| Axis | Checks | Heavy for |
|------|--------|-----------|
| **Scope** | What's in, what's out, what's explicitly excluded | Features, PRDs |
| **Gaps** | Phases or steps probably forgotten | Refactors, cleanups |
| **Blast radius** | What else is affected and unaccounted for | Architecture, shared infra |

By plan type:

- Feature → scope + gaps
- Refactor / cleanup → gaps + blast radius
- Bug fix → root cause confirmed + regression risk
- Architecture → blast radius + scope

## Peripheral skills (hops from these playbooks)

Planning orchestrates work; it does **not** replace other skills:

| Skill | When |
|-------|------|
| **crystallize** / **grill** | When intent or assumptions are still fuzzy (`build.md` Step 5). |
| **second-opinion** | Fresh read before finalize; or **verify stance** for axis checklist on a written artifact. |
| **investigate** | One concrete code-path hunch → evidence (`build.md` Step 5). |
| **multi** | Parallel surface exploration — [parallel-explore.md](parallel-explore.md) (`build.md` Step 3); large plan evidence — [parallel-plan-evidence.md](../../../second-opinion/references/parallel-plan-evidence.md) (second-opinion Stance A) |
| **project-tracking** | Branch, draft PR, Closes, Linear state **after** a plan exists and you’re starting work (`verify.md` Step 5). |
| **code-review** | Holistic PR / implementation review **after** code exists; AI drift / hygiene on staged/unstaged (consumer AI-drift doc / customize). |

Structural checks in plans → **second-opinion** ([second-opinion.md](../../../second-opinion/references/second-opinion.md)).
