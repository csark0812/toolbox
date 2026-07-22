# Planning playbooks (shared references)

**Opt-in soft-default recipe:** Full Linear / `docs/prds/` baseline for consumers with **no** planning remap. Consumers that remap via customize (`shared-agent-references` / docs) must **not** use this file — open the consumer planning SSOT instead.

Execution planning and **completeness verify** live here as **reference docs**, not as a standalone invocable skill. Use the right **entry skill**, then open the matching playbook.

## Files

| File                                 | Purpose                                                         | Usual entry                                                                             |
| ------------------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [build.md](build.md)                 | Guided planning from scratch → CreatePlan / PRD / Linear issues | **crystallize** or **grill** (after dialogue), or directly when intent is already clear |
| [verify.md](verify.md)               | Three-axis completeness checklist (loaded by second-opinion completeness attacker) | **second-opinion** (staged debate)                                                  |
| [plan-format.md](plan-format.md)     | CreatePlan template + self-check                                | After `build.md` when output is todos                                                   |
| [prd-format.md](prd-format.md)       | PRD template for `docs/prds/`                                   | After `build.md` when output is a PRD                                                   |
| [issues-format.md](issues-format.md) | Vertical-slice Linear issues                                    | After `build.md` when output is issues                                                  |

**Written plan review** (premises + completeness + defender) → **second-opinion** skill, [second-opinion reference](../../../../second-opinion/references/second-opinion.md).

## Completeness axes

All three axes run on every plan; weighting shifts by plan type (used in **build** and **verify**).

| Axis             | Checks                                            | Heavy for                  |
| ---------------- | ------------------------------------------------- | -------------------------- |
| **Scope**        | What's in, what's out, what's explicitly excluded | Features, PRDs             |
| **Gaps**         | Phases or steps probably forgotten                | Refactors, cleanups        |
| **Blast radius** | What else is affected and unaccounted for         | Architecture, shared infra |

By plan type:

- Feature → scope + gaps
- Refactor / cleanup → gaps + blast radius
- Bug fix → root cause confirmed + regression risk
- Architecture → blast radius + scope

## Peripheral skills (hops from these playbooks)

Planning orchestrates work; it does **not** replace other skills:

| Skill                       | When                                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **crystallize** / **grill** | When intent or assumptions are still fuzzy (`build.md` Step 5).                                                                                                                                                                             |
| **second-opinion**          | Written artifact review via staged debate (premises + completeness attackers, then defender).                                                                                                                                               |
| **investigate**             | One concrete code-path hunch → evidence (`build.md` Step 5).                                                                                                                                                                                |
| **multi**                   | Parallel surface exploration — [parallel-explore.md](parallel-explore.md) (`build.md` Step 3); optional large-plan evidence — [parallel-plan-evidence.md](../../../../second-opinion/references/parallel-plan-evidence.md) before debate |
| **Optional tracker skill**  | Branch, draft PR, Closes / issue-tracker state **after** a plan exists and you’re starting work (`verify.md` Step 5), if the consumer ships one.                                                                                            |
| **code-review**             | Holistic PR / implementation review **after** code exists; AI drift / hygiene on staged/unstaged (consumer AI-drift doc / customize).                                                                                                       |

Structural checks in plans → **second-opinion** ([second-opinion.md](../../../../second-opinion/references/second-opinion.md)).
