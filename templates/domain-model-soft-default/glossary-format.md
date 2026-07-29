# Glossary format

**Opt-in soft-default recipe:** Full glossary baseline for consumers with **no** domain-artifact remap. Consumers that remap via customize must **not** use this file — open the consumer SSOT instead.

Save to `docs/glossary.md` unless customize remaps the path. Create the file if it does not exist.

## Row shape

Each term is one `###` block:

| Field               | Required       | Notes                                    |
| ------------------- | -------------- | ---------------------------------------- |
| **Term**            | yes            | Canonical name — one term, one meaning   |
| **Definition**      | yes            | Plain-language meaning in this codebase  |
| **Bounded context** | when ambiguous | Where this term applies                  |
| **Aliases**         | no             | Deprecated names → canonical term        |
| **Status**          | no             | `proposed` \| `accepted` \| `deprecated` |

## Example

```markdown
### Workspace

**Definition:** A tenant-scoped container for projects and members.
**Bounded context:** Account / org management
**Aliases:** team (deprecated — use Workspace)
**Status:** accepted
```

## Rules

- Dedupe before add — update in place rather than fork synonyms.
- Persistence is via **domain-model** skill after grill/crystallize sharpen terms.
