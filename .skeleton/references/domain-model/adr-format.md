# ADR format (MADR-style)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Opt-in soft-default recipe:** Lightweight architecture decision records for consumers with **no** domain-artifact remap.

Default directory: `docs/adr/` — numbered `NNNN-title.md`. Consumer customize can remap.

## Template

```markdown
# [short title]

**Status:** proposed | accepted | deprecated | superseded by [ADR-NNNN]
**Date:** YYYY-MM-DD

## Context

[What forces are at play — technical, organizational, constraints. 2–5 sentences.]

## Decision

[What we decided — active voice, specific.]

## Rejected alternatives

- **[Alternative A]:** [why not]
- **[Alternative B]:** [why not]

## Consequences

- **Positive:** [...]
- **Negative / tradeoffs:** [...]

## Related

- Glossary: [terms]
- Code: [paths or modules, if known]
```

## Anti-theater rules

- **No ADR without a stated decision** — if the choice is still open, route to [`grill`](../../../grill/SKILL.md).
- **Rejected alternatives required** — at least one plausible option you did not take.
- **Link glossary terms** when the decision introduces or changes ubiquitous language.
- Structural boundary decisions can cite [codebase-design.md](../codebase-design.md) (deep module, seam, information hiding).
