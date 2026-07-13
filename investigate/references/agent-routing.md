<!-- skeleton: generated-reference
source: .skeleton/references/agent-routing.md
redundancy: intentional
-->

# Agent ambient routing

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Portable stub (incomplete):** Toolbox ships only this baseline. **Do not treat the tables below as a full consumer routing matrix.**

Consumer projects must map this path via customize (`shared-agent-references` / `docs/.../agent-routing.md` or equivalent). Full Pre-ship (`validate:changed --pre-pr`, product-intent), fuzzy → product-principles, Quality & ops (testing/debug pairing), and TanStack/UI rows live in the **consumer SSOT**, not here.

## What this file is for

- Keeps relative links inside the skill tree resolvable for standalone toolbox clones.
- Points agents at consumer override when customize / alwaysInclude injects.

## Portable baseline (incomplete)

| Situation                 | Escalate (generic)      |
| ------------------------- | ----------------------- |
| Fuzzy intent              | grill / dialogue skills |
| Specific code doubt       | investigate             |
| Holistic PR / ship review | code-review             |
| Plan artifact review      | second-opinion          |

**If you only have this stub:** open the consumer `agent-routing` SSOT named by `.skeleton/customize/shared-agent-references.md` (or project `AGENTS.md`) before applying Pre-ship, Quality & ops, or product escalations.

## Related

- Consumer dialogue handoffs and planning live outside this stub — follow customize redirects.
