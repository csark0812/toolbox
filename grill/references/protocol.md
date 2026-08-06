# Grill protocol

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Design-tree dialogue before implementation. Shared behavior → [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md). Mid-turn asks → [ask.md](ask.md).

## Core moves

1. **Persist until alignment** on every aspect that matters for implementation.
2. **Walk the design tree** — resolve dependencies before committing to a path.
3. **Facts vs decisions** — look up facts in repo/tools/docs; decisions are the user's.
4. **Ask via [ask.md](ask.md)** — 1–3 same-branch lettered questions; wait for answers; new tree node → new turn.
5. **Provisional recommendation** — mark `(recommended)` on one option and a separate Recommended why-row ([ask.md](ask.md)).
6. **Falsifier** — after user engages, what would show the branch wrong? (record before leaving the node).
7. **Sharpen terms** against glossary — grill does not write ADRs/glossary.
8. **Implement only after alignment** — [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md) when **When to stop** met.

## Design tree (each node)

- Branches here?
- Which branch and why? (provisional recommendation via ask.md)
- Dependencies to resolve first?
- Falsifier before leaving node?

## When to stop

- Significant choices explicit; dependencies ordered
- Falsifier recorded per node
- Silent-topic scan: failure modes, constraints, ownership, rollback, NFR — decided or marked in/out of scope
- User confirms shared understanding (or explicitly skips)

Optional repo explore for a branch → **subagents** + parallel-explore (planning ambient); grill stays dialogue-first.

## Question cadence

Use [ask.md](ask.md). Closed picks by default; `Other:` only when the option set may be incomplete.

Avoid: free-form multi-question dumps outside the ask block; steering "Have you considered X?" without lettered options.
