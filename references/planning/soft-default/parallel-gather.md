# Parallel Gather

**Opt-in soft-default recipe:** Use this only when the consumer has no planning remap.

Collection from independent sources of truth. Uses the [council](../../../../council/SKILL.md) persona contract and [persona prompt](../../../../council/references/persona-prompt.md).

## When to use

- Planning needs constraints from separate source-of-truth files or domains.
- The user asks to gather context across independent areas.

## When to skip

- One file or documentation hub already owns the answer.
- The task needs blast-radius mapping rather than fact collection.
- The topics require independent web research.

## Task personas

Create one persona per source of truth. Each persona owns one question, one evidence boundary, and one falsifier for stale or conflicting guidance.

Use **independent panel**. No member makes cross-source conclusions during the first round.

## Synthesis

1. Merge facts by source.
2. Preserve path attribution.
3. Surface conflicts between sources.
4. Continue planning with the gathered facts. Use **probe** when one specific doubt remains.
