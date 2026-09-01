# Planning playbooks (shared references)

**Opt-in soft-default recipe:** Full Linear / `docs/prds/` baseline for consumers with **no** planning remap. Consumers that remap via customize (`shared-agent-references` / docs) must **not** use this file — open the consumer planning SSOT instead.

Execution planning and **completeness verify** live here as **reference docs**, not as a standalone invocable skill. Use the right **entry skill**, then open the matching playbook.

## Files

| File                                 | Purpose                                                                                                     | Usual entry                                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [build.md](build.md)                 | Guided planning from scratch → CreatePlan / PRD / Linear issues                                             | **grill** after focused intent or design dialogue, or directly when intent is already clear |
| [verify.md](verify.md)               | Three-axis completeness checklist (loaded when second-opinion invents a readiness/gaps `completeness` lens) | **second-opinion** (layer **council** when multi-perspective depth is wanted)               |
| [plan-format.md](plan-format.md)     | CreatePlan template + self-check                                                                            | After `build.md` when output is todos                                                       |
| [prd-format.md](prd-format.md)       | PRD template for `docs/prds/`                                                                               | After `build.md` when output is a PRD                                                       |
| [issues-format.md](issues-format.md) | Vertical-slice Linear issues                                                                                | After `build.md` when output is issues                                                      |

**Written plan review** → **second-opinion** skill ([plan-review.md](../../../../second-opinion/references/plan-review.md)). For readiness-shaped asks, suggest wording that invents `premises` + `completeness` lenses (layer **council** for multi-perspective depth) — not a skill default.

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

| Skill                      | When                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **grill**                  | When intent or assumptions are still fuzzy (`build.md` Step 5) — clarify the outcome, then pressure-test material choices.                           |
| **second-opinion**         | Written artifact review (path or paste) — invent lenses; single-pass by default; layer **council** for multi-perspective depth                       |
| **probe**                  | One concrete code-path hunch → evidence (`build.md` Step 5).                                                                                         |
| **council**                | Multi-agent depth — invent perspectives and spawn; use with [parallel-explore.md](parallel-explore.md) (`build.md` Step 3) or layered second-opinion |
| **Optional tracker skill** | Branch, draft PR, Closes / issue-tracker state **after** a plan exists and you’re starting work (`verify.md` Step 5), if the consumer ships one.     |
| **code-review**            | Holistic PR / implementation review **after** code exists; AI drift / hygiene on staged/unstaged (consumer AI-drift doc / customize).                |

Structural checks in plans → **second-opinion** ([plan-review.md](../../../../second-opinion/references/plan-review.md)).
