---
name: domain-modeling
description: Sharpen overloaded business/domain terms against docs/domain/glossary.md, challenge conflicting user language, and update the glossary inline as terms resolve. Offer a domain ADR only when a decision is hard-to-reverse, surprising without context, and the result of a real trade-off. Not for product thesis scoring (product-principles), UI tokens (components), or code-structure vocabulary (developer/codebase-design.md).
---

# Domain modeling

Ambient discipline for **shared business vocabulary** — not a dialogue session. Canonical glossary: [`docs/domain/glossary.md`](../../../docs/domain/glossary.md). Hub router: [`docs/domain/README.md`](../../../docs/domain/README.md).

## When to Use

- User or plan uses an overloaded term (`source`, `paper`, `document`, `note`, `account`, …)
- Fuzzy domain language blocks implementation or review
- A naming choice will persist in API, schema, or UI copy
- During **crystallize** or **grill** when a term resolves — update glossary inline; this skill owns vocabulary, dialogue skills feed it

Not for: product build gates ([`product-principles`](../product-principles/SKILL.md)), monorepo layout ([`developer/architecture.md`](../../../docs/developer/architecture.md)), code-structure naming ([`developer/codebase-design.md`](../../../docs/developer/codebase-design.md)), or Socratic ideation ([`crystallize`](../crystallize/SKILL.md) / [`grill`](../grill/SKILL.md)).

## Protocol

1. **Challenge against glossary** — when user language conflicts with [`glossary.md`](../../../docs/domain/glossary.md), name the canonical term and ask which meaning they intend.
2. **Sharpen overload** — e.g. is "account" the billing Customer or the signed-in User? State options; pick one canonical term for the thread.
3. **Write inline** — when a term crystallizes, add or update its glossary entry immediately (one term per edit moment, not end-of-session batch).
4. **ADR gate** — offer [`docs/domain/adr/`](../../../docs/domain/adr/README.md) only when **all three** hold: hard-to-reverse, surprising without context, real trade-off. Otherwise glossary entry only.
5. **Hand off** — product scope/thesis → **product-principles**; implementation placement → **grill** or planning/build; code hunch → **investigate**.

## Glossary entry shape

Follow the table format in [`glossary.md`](../../../docs/domain/glossary.md): **Means**, **Not**, **See also**.

## Output format

Follow [references/output-schema.md](references/output-schema.md). When terms resolve:

```markdown
## Terms resolved
- **[term]**: [canonical meaning chosen]
- Glossary updated: [path or "pending user confirm"]

## ADR offered?
- [Yes — why all three gates met | No — glossary sufficient]

## Next step
- [Continue grill/crystallize/build | product-principles | investigate]
```
