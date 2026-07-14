# Plan format

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Portable stub (incomplete):** Toolbox ships only this baseline. **Do not execute planning recipes from this file.**

Consumer projects remap this path through hook-injected customize / alwaysInclude context (`shared-agent-references` / project planning docs or equivalent). When that injected planning SSOT exists, use it — never Linear / `docs/prds/` soft-defaults from this stub. Soft-default setup for bare consumers is operator-facing (`templates/soft-default-planning.md`), not opened from this stub.

## What this file is for

- Keeps relative `references/planning/plan-format.md` links resolvable in standalone toolbox clones.
- Points agents at the hook-injected consumer planning SSOT when present.

## If you only have this stub

1. Prefer the hook-injected consumer planning context when skill read provided it.
2. Do **not** invent Linear issues or write `docs/prds/` from this stub.
3. Soft-default recipes are **not** shipped inside portable skill trees.
