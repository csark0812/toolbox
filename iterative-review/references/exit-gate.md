# Exit gate

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Layered exit — **not** "zero findings." Split subagent vs coordinator signals.

## Layers

| Layer            | Actor          | Requirement                                                                                   |
| ---------------- | -------------- | --------------------------------------------------------------------------------------------- |
| 1 Matrix         | Blind subagent | Adapter-specific rows checked or N/A with reason ([adapters.md](adapters.md))                 |
| 2 Local cohesion | Blind subagent | `Cohesion: attested-local` on the pass                                                        |
| 3 Clean streak   | Coordinator    | `Clean streak: N/M` with default **M=2** consecutive passes with no Action findings           |
| 4 Thrash clear   | Coordinator    | No open thrash signal ([thrash-ledger.md](thrash-ledger.md)); no reopened theme lacking sweep |
| 5 Validation     | Coordinator    | Consumer authoritative validation lane passed, or output states what was not run              |

## Closure signal

Coordinator emits **`Closure: ready`** only when layers 1–5 pass.

Forbidden:

- `Closure: ready` on a pass with Action > 0
- `Closure: ready` with `Cohesion: not-attested` on the latest pass
- `Closure: ready` with `Clean streak` below M
- Subagent emits `Closure: ready` (coordinator-only)

Use summary block `**Closure:** ready` in [SKILL.md](../SKILL.md) output format.

## Premature closure (named failure mode)

Closing after fixing only the reported example, or attested-local with incomplete matrix / thrash, is **premature closure**. On detection:

1. Reopen existing `theme_id`.
2. Reset clean streak.
3. Do not mint sibling Action theme for the adjacent edge.

See [`code-review` fix-loop-ledger § Premature closure](../../code-review/references/fix-loop-ledger.md#premature-closure-named-failure-mode).

## Streak heuristic

M=2 is a default — same model stack may share blind spots across consecutive blind passes. Document moderate confidence in [research-basis.md](research-basis.md). User may ask for M=3 on high-stakes slices.

## Adapter-specific matrix

**Code slice:** minimum applicable invariant-matrix rows from fix-loop-ledger.

**Plan section:** scope / gaps / sequencing axes — each checked or N/A.

Whole-matrix N/A alone fails under `Thrash: inventory-required`.
