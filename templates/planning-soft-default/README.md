# Planning playbooks (shared references)

**Opt-in soft-default recipe:** Full Linear / `docs/prds/` baseline for consumers with **no** planning remap. Consumers that remap via customize (`shared-agent-references` / docs) must **not** use this file. Open the consumer planning SSOT instead.

Execution planning and the **completeness** playbook (`verify.md`) live here as **reference docs**, not as a standalone invocable skill. Use the right **entry skill**. Then open the matching playbook.

## Files

| File                                 | Purpose                                                                            | Usual entry                                                                                      |
| ------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [build.md](build.md)                 | Guided planning from scratch → CreatePlan / PRD / Linear issues                    | **grill** (intent phase or design tree after dialogue), or directly when intent is already clear |
| [verify.md](verify.md)               | Three-axis completeness checklist (loaded by second-opinion completeness attacker) | **second-opinion** (staged debate)                                                               |
| [plan-format.md](plan-format.md)     | CreatePlan template + Self-Check                                                   | After `build.md` when output is todos                                                            |
| [prd-format.md](prd-format.md)       | PRD template for `docs/prds/`                                                      | After `build.md` when output is a PRD                                                            |
| [issues-format.md](issues-format.md) | Vertical-slice Linear issues                                                       | After `build.md` when output is issues                                                           |

**Written plan review** (full cast: premises + completeness + defender, or light cast by depth) → **second-opinion** skill, [plan-review.md](../../../../second-opinion/references/plan-review.md) · [second-opinion-dispatch.md](../../../../subagents/references/second-opinion-dispatch.md).

## Completeness axes

All three axes run on every plan. Weighting shifts by plan type (used in **build** and **verify**).

| Axis             | Checks                                               | Heavy for                  |
| ---------------- | ---------------------------------------------------- | -------------------------- |
| **Scope**        | What is in, what is out, what is explicitly excluded | Features, PRDs             |
| **Gaps**         | Phases or steps that are often forgotten             | Refactors, cleanups        |
| **Blast radius** | What else is affected and unaccounted for            | Architecture, shared infra |

By plan type:

- Feature → scope + gaps
- Refactor / cleanup → gaps + blast radius
- Bug fix → root cause confirmed + regression risk
- Architecture → blast radius + scope

## Peripheral skills (hops from these playbooks)

Planning orchestrates work. It does **not** replace other skills:

| Skill                      | When                                                                                                                                                                                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **grill**                  | When intent or assumptions are still fuzzy (`build.md` Step 5) — intent phase then design tree.                                                                                                                                           |
| **second-opinion**         | Written artifact review (path or paste) via full or light cast — full = both attackers then defender. Light = one stance, defender optional.                                                                                              |
| **probe**                  | One concrete code-path hunch → evidence (`build.md` Step 5).                                                                                                                                                                              |
| **subagents**              | Parallel surface exploration — [parallel-explore.md](parallel-explore.md) (`build.md` Step 3). Optional large-plan evidence — [second-opinion-evidence-dispatch.md](../../../../subagents/references/second-opinion-evidence-dispatch.md) |
| **Optional tracker skill** | Branch, draft PR, Closes / issue-tracker state **after** a plan exists and you are starting work (`verify.md` Step 5), if the consumer ships one.                                                                                         |
| **code-review**            | Holistic PR / implementation review **after** code exists. AI drift / hygiene on staged/unstaged (consumer AI-drift doc / customize).                                                                                                     |

Structural checks in plans → **second-opinion** ([plan-review.md](../../../../second-opinion/references/plan-review.md)).
