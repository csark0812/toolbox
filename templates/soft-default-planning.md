<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Source of truth for** bare consumers that want toolbox Linear / `docs/prds/` planning baselines.

Copy to `.skeleton/customize/soft-default-planning.md` and add the basename to `customize.alwaysInclude` in `.skeleton/config.yaml` **only** when the project has **no** planning docs remap (e.g. no `docs/developer/planning/`).

Remapping consumers (shared-agent-references → project planning docs) must **not** include this file.

## Soft-default planning remap

When a skill cites `references/planning/<file>.md`, open the opt-in soft-default recipe beside it:

| Skill cites                               | Soft-default recipe                                    |
| ----------------------------------------- | ------------------------------------------------------ |
| `references/planning/README.md`           | `references/planning/soft-default/README.md`           |
| `references/planning/build.md`            | `references/planning/soft-default/build.md`            |
| `references/planning/verify.md`           | `references/planning/soft-default/verify.md`           |
| `references/planning/prd-format.md`       | `references/planning/soft-default/prd-format.md`       |
| `references/planning/plan-format.md`      | `references/planning/soft-default/plan-format.md`      |
| `references/planning/issues-format.md`    | `references/planning/soft-default/issues-format.md`    |
| `references/planning/parallel-explore.md` | `references/planning/soft-default/parallel-explore.md` |
| `references/planning/parallel-gather.md`  | `references/planning/soft-default/parallel-gather.md`  |
| Other `references/planning/*`             | `references/planning/soft-default/` (match filename)   |

## Hard gate

Skill-local `references/planning/*.md` files (not under `soft-default/`) are **fail-loud stubs**. Do not execute them. With this customize binder active, load `soft-default/<file>` instead.

PRD default path in soft-default recipes: `docs/prds/` (not a remapping consumer product path).
