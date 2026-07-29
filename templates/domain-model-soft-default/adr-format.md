# ADR format (MADR-style)

**Opt-in soft-default recipe:** ADR baseline for consumers with **no** domain-artifact remap.

Save to `docs/adr/NNNN-short-title.md` (four-digit zero-padded number). Create the directory if needed.

## Template

```markdown
# [short title]

**Status:** proposed | accepted | deprecated | superseded by [ADR-NNNN]
**Date:** YYYY-MM-DD

## Context

[What forces are at play — 2–5 sentences.]

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

## Rules

- No ADR without a stated decision — open choices go to **grill**.
- Rejected alternatives required — at least one plausible option not taken.
