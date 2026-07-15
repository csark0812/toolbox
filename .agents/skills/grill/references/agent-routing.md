<!-- skeleton: generated-reference
source: .skeleton/references/agent-routing.md
redundancy: intentional
-->

# Agent ambient routing

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

**Portable stub (incomplete):** Toolbox ships only this baseline. **Do not treat the tables below as a full consumer routing matrix.**

Consumer projects remap this path through hook-injected customize / alwaysInclude context (`shared-agent-references` / project `agent-routing` docs or equivalent). Full Pre-ship (validator command, product-intent), fuzzy → consumer product skill, Quality & ops (test/debug pairing), and stack/UI rows live in the **consumer SSOT**, not here.

## What this file is for

- Keeps relative links inside the skill tree resolvable for standalone toolbox clones.
- Points agents at the hook-injected consumer routing SSOT when present.

## Portable baseline (incomplete)

| Situation                 | Escalate (generic)      |
| ------------------------- | ----------------------- |
| Fuzzy intent              | grill / dialogue skills |
| Specific code doubt       | investigate             |
| Holistic PR / ship review | code-review             |
| Plan artifact review      | second-opinion          |

**If you only have this stub:** prefer the hook-injected consumer routing context when skill read provided it (or project `AGENTS.md`) before applying Pre-ship, Quality & ops, or product escalations.

## Related

- Consumer dialogue handoffs and planning live outside this stub — follow hook-injected redirects.
