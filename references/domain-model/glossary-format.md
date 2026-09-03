# Glossary format

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Opt-in soft-default recipe:** Baseline glossary row shape for consumers with **no** domain-artifact remap. Consumers that remap paths via customize must open the consumer SSOT instead.

Default save path is project-configured (commonly `docs/glossary.md` or `CONTEXT.md` via customize). It is **not** hardcoded in skills.

## Row shape

Each term is one row or one `###` block:

| Field               | Required       | Notes                                                        |
| ------------------- | -------------- | ------------------------------------------------------------ |
| **Term**            | yes            | Canonical name — one term, one meaning (ubiquitous language) |
| **Definition**      | yes            | Plain-language meaning in this codebase                      |
| **Bounded context** | when ambiguous | Where this term applies. Omit when global                    |
| **Aliases**         | no             | Deprecated or colloquial names — point at canonical term     |
| **Status**          | no             | `proposed` \| `accepted` \| `deprecated`                     |

## Example

```markdown
### Workspace

**Definition:** A tenant-scoped container for projects and members.
**Bounded context:** Account / org management
**Aliases:** team (deprecated — use Workspace)
**Status:** accepted
```

## Rules

- **Dedupe before add** — search existing glossary. Update in place rather than fork synonyms.
- **No product marketing names** in the hub — consumer content only.
- Grill can sharpen terms in dialogue. This format is for **persistence** via [`domain-model`](../../../domain-model/SKILL.md).
