# Parallel Explore

**Opt-in soft-default recipe:** Use this only when the consumer has no planning remap.

Map blast radius across independent product domains. Use this recipe only when multi-agent orchestration is active.

## When to use

- A plan needs structure from two or more independent domains.
- A Grill branch depends on broad repository facts.
- A written-plan review needs a codebase map beyond its cited files.

## When to skip

- One component or one authoritative path can answer the question.
- The relevant paths are already in context.

## Task personas

Create one persona per ownership boundary, not per arbitrary file group.

| Persona example | Question                                        | Evidence                                    |
| --------------- | ----------------------------------------------- | ------------------------------------------- |
| backend-surface | Which backend owners and contracts can change?  | API, domain, persistence, and jobs          |
| client-surface  | Which client flows and state owners can change? | Data layer, routes, components, and state   |
| shared-boundary | Which shared contracts connect the domains?     | Types, schemas, packages, and configuration |

Use **independent panel**. Merge personas that ask the same question or inspect the same ownership boundary.

## Synthesis

1. Merge the domain maps.
2. Name uncited blast radius.
3. Preserve ownership conflicts.
4. Continue planning with the gathered facts. A layered process skill owns the final output.
