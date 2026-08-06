# Grill protocol

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Design-tree dialogue before implementation. Shared behavior → [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md).

## Core moves

1. **Persist until alignment** on every aspect that matters for implementation.
2. **Walk the design tree** — resolve dependencies before committing to a path.
3. **Facts vs decisions** — look up facts in repo/tools/docs; decisions are the user's.
4. **One decision per turn** — wait for answer; chained follow-ups on same branch only.
5. **Provisional recommendation** — default branch + one-line why; invite pushback.
6. **Falsifier** — after user engages, what would show the branch wrong?
7. **Sharpen terms** against glossary — grill does not write ADRs/glossary.
8. **Implement only after alignment** — [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md) when **When to stop** met.

## Design tree (each node)

- Branches here?
- Which branch and why? (provisional recommendation)
- Dependencies to resolve first?
- Falsifier before leaving node?

## When to stop

- Significant choices explicit; dependencies ordered
- Falsifier recorded per node
- Silent-topic scan: failure modes, constraints, ownership, rollback, NFR — decided or marked in/out of scope
- User confirms shared understanding (or explicitly skips)

Optional repo explore for a branch → **subagents** + parallel-explore (planning ambient); grill stays dialogue-first.

## Question cadence

Good: "What are the branches here?" / "What would show this branch wrong?"

Avoid: multi-question dumps; steering "Have you considered X?"
