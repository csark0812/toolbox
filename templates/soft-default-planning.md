<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Source of truth for** bare consumers that want toolbox Linear / `docs/prds/` planning baselines.

**Setup** (only when the project has **no** planning docs remap, e.g. no `docs/developer/planning/`):

1. Copy `templates/planning-soft-default/` → `.skeleton/customize/planning-soft-default/`
2. Copy this file → `.skeleton/customize/soft-default-planning.md`
3. Add `soft-default-planning.md` to `customize.alwaysInclude` in `.skeleton/config.yaml`

Remapping consumers (shared-agent-references → project planning docs) must **not** include this file. Soft-default recipes are **not** shipped inside portable skill trees.

## Soft-default planning remap

Operator mapping after setup (copied into customize for hook injection). When a skill cites `references/planning/<file>.md`, the binder + alwaysInclude inject the soft-default pack — agents should use that injected planning context, not skill-local soft-default stubs:

| Skill cites                               | Soft-default recipe                                             |
| ----------------------------------------- | --------------------------------------------------------------- |
| `references/planning/README.md`           | `.skeleton/customize/planning-soft-default/README.md`           |
| `references/planning/build.md`            | `.skeleton/customize/planning-soft-default/build.md`            |
| `references/planning/verify.md`           | `.skeleton/customize/planning-soft-default/verify.md`           |
| `references/planning/prd-format.md`       | `.skeleton/customize/planning-soft-default/prd-format.md`       |
| `references/planning/plan-format.md`      | `.skeleton/customize/planning-soft-default/plan-format.md`      |
| `references/planning/issues-format.md`    | `.skeleton/customize/planning-soft-default/issues-format.md`    |
| `references/planning/parallel-explore.md` | `.skeleton/customize/planning-soft-default/parallel-explore.md` |
| `references/planning/parallel-gather.md`  | `.skeleton/customize/planning-soft-default/parallel-gather.md`  |
| Other `references/planning/*`             | `.skeleton/customize/planning-soft-default/` (match filename)   |

## Hard gate

Skill-local `references/planning/*.md` files are **fail-loud stubs**. Do not execute them. With this customize binder listed in `customize.alwaysInclude`, prefer the hook-injected soft-default planning context instead of opening customize paths manually.

PRD default path in soft-default recipes: `docs/prds/` (not a remapping consumer product path).
