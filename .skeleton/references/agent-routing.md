# Agent ambient routing

<!-- doc-meta: owner=eng | last-reviewed=2026-07-15 -->

**Portable stub:** Toolbox ships announce contracts + a generic escalate table. **Do not treat this as a full consumer routing matrix.**

Consumer projects remap this path through hook-injected customize / alwaysInclude context (`shared-agent-references` / project `agent-routing` docs or equivalent). Full Pre-ship (validator command, product-intent), fuzzy → consumer product skill, Quality & ops (test/debug pairing), and stack/UI rows live in the **consumer SSOT**, not here.

## What this file is for

- Keeps relative links inside the skill tree resolvable for standalone toolbox clones.
- Defines the portable **hands-on** / **hands-off** announce contracts live dogfood and agents must follow before tools.
- Points agents at the hook-injected consumer routing SSOT when present.

## Agent loop (portable)

Same behavior hands-on and hands-off — only visibility differs (chat line vs PR § Routing).

1. **Classify** — pick Low | Medium | High (default **up** on ambiguity).
2. **Announce before tools** — hands-on: [one-line](#hands-on-announce); hands-off PR work: [PR § Routing](#pr--routing-hands-off).
3. **Work** — edit, investigate, or answer.
4. **Re-classify** at boundaries (before implement commit, before PR / done, when scope grows).

Do **not** call tools, search the repo for this file, or draft other prose until the announce step is complete. The templates below (and the cold-start copy in `AGENTS.md`) are self-contained — prefer them (or injected consumer SSOT) over discovery.

## Hands-on announce

Before any tools or edits, print **one line** that includes the tier, for example:

- `Low — single-file helper fix with focused validation.`
- `Medium — design pressure-test before implementation.`
- `Tier: low — …` or `Routing: Medium — …`

## PR § Routing (hands-off)

Mandatory when creating, updating, or drafting a PR. Tier is at least **Medium** (never Low for PR text). Print this block as the **first** assistant output — **do not call tools** until it is complete:

```markdown
## Routing

- **Tier:** Low | Medium | High
- **Signals:** …
- **Invariant applied:** …
- **Escalations:** none | …
- **Open questions:** none | …
```

Then continue with Summary / Test plan (or equivalent). No file edits when the user asked for PR text only.

## Portable baseline (incomplete)

| Situation                 | Escalate (generic)                                              |
| ------------------------- | --------------------------------------------------------------- |
| Fuzzy intent              | grill / dialogue skills                                         |
| Specific code doubt       | investigate                                                     |
| Before implement          | grill extract (branches, deps, falsifier)                       |
| Plan on disk              | second-opinion                                                  |
| Holistic PR / ship review | code-review                                                     |
| Pre-ship / PR             | code-review; hands-off → [PR § Routing](#pr--routing-hands-off) |

### Fuzzy intent

Mirror the half-formed goal; one assumption check; escalate to **crystallize** / **grill** when still vague.

### Specific doubt

Two ranked hypotheses + primary-source read; escalate to **investigate** when partial or boundary-crossing.

### Before implement

State branches, deps, and a falsifier (grill extract); full **grill** when unresolved.

### Plan on disk

Inline axis pass on the artifact; escalate to **second-opinion** for structural gaps.

### Pre-ship / PR

Path-scoped validation when implementing; for PR create/update/draft use [PR § Routing](#pr--routing-hands-off) before other output; escalate to **code-review** for holistic review.

### Quality & ops

Full test/debug pairing and product handoffs live in the **consumer SSOT**. Prefer hook-injected consumer routing when present.

**If you only have this stub:** apply the announce contracts above, then the escalate table — prefer injected consumer context (or project `AGENTS.md`) before Pre-ship, Quality & ops, or product escalations beyond this baseline.

## Related

- Consumer dialogue handoffs and planning live outside this stub — follow hook-injected redirects.
