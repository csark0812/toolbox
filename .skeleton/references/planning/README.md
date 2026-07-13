# Planning references

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Portable stub (incomplete):** Toolbox ships only this baseline. **Do not execute planning recipes from this file.**

Consumer projects must map this path via customize (`shared-agent-references` / `docs/.../planning/` or equivalent). Remapping consumers open their planning SSOT — never Linear / `docs/prds/` soft-defaults (binder + customize pack only for bare consumers).

## What this file is for

- Keeps relative `references/planning/README.md` links resolvable in standalone toolbox clones.
- Points agents at consumer override when customize / alwaysInclude injects.

## If you only have this stub

1. Open the consumer planning SSOT named by `.skeleton/customize/` (often `shared-agent-references.md` / alwaysInclude).
2. Do **not** invent Linear issues or write `docs/prds/` from this stub.

## Bare consumers (no planning remap)

Only when customize does **not** remap this path: copy toolbox `templates/planning-soft-default/` to `.skeleton/customize/planning-soft-default/`, copy `templates/soft-default-planning.md` to `.skeleton/customize/soft-default-planning.md`, and list that basename in `customize.alwaysInclude`. Soft-default recipes are **not** shipped inside portable skill trees.

Do not invent Linear / `docs/prds/` work from this stub without that binder. Do not treat soft-default as authoritative when a consumer remap exists.
