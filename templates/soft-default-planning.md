<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

<!-- source-of-truth: bare consumers that want toolbox Linear / `docs/prds/` planning baselines. -->

**Setup** (only when the project has **no** planning docs remap, for example no `docs/developer/planning/`):

1. Re-home `templates/planning-soft-default/` in a consumer-local skill (for example `.claude/skills/soft-default-planning/planning-soft-default/`) or in project docs (for example `docs/planning-soft-default/`)
2. Copy this file beside it as the binder (the skill's `SKILL.md` body, or `docs/soft-default-planning.md`)
3. Point `AGENTS.md` at the binder so agents load it with planning work

Remapping consumers (shared-agent-references → project planning docs) must **not** include this file. Soft-default recipes are **not** shipped inside portable skill trees.

## Soft-default planning remap

Operator mapping after setup (paths relative to where you re-homed the pack). When a skill cites `references/planning/<file>.md`, the binder points agents at the soft-default pack. Agents must use that consumer planning context, not skill-local soft-default stubs:

| Skill cites                               | Soft-default recipe                         |
| ----------------------------------------- | ------------------------------------------- |
| `references/planning/README.md`           | `planning-soft-default/README.md`           |
| `references/planning/build.md`            | `planning-soft-default/build.md`            |
| `references/planning/verify.md`           | `planning-soft-default/verify.md`           |
| `references/planning/prd-format.md`       | `planning-soft-default/prd-format.md`       |
| `references/planning/plan-format.md`      | `planning-soft-default/plan-format.md`      |
| `references/planning/issues-format.md`    | `planning-soft-default/issues-format.md`    |
| `references/planning/parallel-explore.md` | `planning-soft-default/parallel-explore.md` |
| `references/planning/parallel-gather.md`  | `planning-soft-default/parallel-gather.md`  |
| Other `references/planning/*`             | `planning-soft-default/` (match filename)   |

## Hard gate

Skill-local `references/planning/*.md` files are **fail-loud stubs**. Do not execute them. With this binder in a consumer-local skill or in project docs that `AGENTS.md` points to, open the re-homed soft-default recipe instead.

PRD default path in soft-default recipes: `docs/prds/` (not a remapping consumer product path).
