# Issues Format

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Portable stub (incomplete):** Toolbox ships only this baseline. **Do not execute planning recipes from this file.**

Consumer projects must map this path via customize (`shared-agent-references` / `docs/.../planning/` or equivalent). Remapping consumers open their planning SSOT — never Linear / `docs/prds/` soft-defaults from the skill tree.

## What this file is for

- Keeps relative `references/planning/issues-format.md` links resolvable in standalone toolbox clones.
- Points agents at consumer override when customize / alwaysInclude injects.

## If you only have this stub

1. Open the consumer planning SSOT named by `.skeleton/customize/` (often `shared-agent-references.md` / alwaysInclude).
2. Do **not** invent Linear issues or write `docs/prds/` from this stub.

## Bare consumers (no planning remap)

Only when customize does **not** remap this path, open the opt-in soft-default recipe:

- [issues-format.md](soft-default/issues-format.md)

Do not treat soft-default as authoritative when a consumer remap exists.
