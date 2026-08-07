# Exit gate

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Layered exit — **not** "zero findings." Split subagent vs coordinator signals.

## Layers

| Layer            | Actor          | Requirement                                                                                      |
| ---------------- | -------------- | ------------------------------------------------------------------------------------------------ |
| 1 Matrix         | Blind subagent | Adapter-specific rows marked checked or N/A with reason ([adapters.md](adapters.md))             |
| 2 Local cohesion | Blind subagent | `Cohesion: attested-local` on the pass                                                           |
| 3 Clean streak   | Coordinator    | `Clean streak: N/M` with default **M=2** consecutive passes with no Action findings              |
| 4 Thrash clear   | Coordinator    | No open thrash signal ([thrash-ledger.md](thrash-ledger.md)). No reopened theme that lacks sweep |
| 5 Validation     | Coordinator    | Consumer authoritative validation lane passed, or output states what was not run                 |

## Closure signal

Coordinator emits **`Closure: ready`** only when layers 1–5 pass.

Forbidden:

- `Closure: ready` on a pass with Action > 0
- `Closure: ready` with `Cohesion: not-attested` on the latest pass
- `Closure: ready` with `Clean streak` below M
- `Closure: ready` while `Thrash: diminishing-returns` or `Thrash: inventory-required` is open
- `Closure: ready` while any finding is still `deferred-to-user` without user resolution
- Subagent emits `Closure: ready` (coordinator-only)

Use summary block `**Closure:** ready` in [SKILL.md](../SKILL.md) output format.

## Soft stop (not ready)

When [thrash-ledger.md](thrash-ledger.md) fires **novelty / diminishing-returns**, or any finding is disposed `deferred-to-user`:

1. Emit pass progress with **Still blocks exit** that names soft stop / pending user judgment.
2. Emit Iterate summary with **`Closure: open`**.
3. **Must not** spawn pass N+1 until the user says continue (or stops the loop).
4. Do **not** emit `Closure: ready`. Soft stop parks the loop. It does not close the bar.

No fixed round budgets — soft stop is signal-driven only.

## Premature closure (named failure mode)

Closing after fixing only the reported example, or attested-local with incomplete matrix / thrash, is **premature closure**. On detection:

1. Reopen existing `theme_id`.
2. Reset clean streak.
3. Do not mint sibling Action theme for the adjacent edge.

See [fix-loop-ledger § Premature closure](fix-loop-ledger.md#premature-closure-named-failure-mode).

## Streak heuristic

M=2 is a default. Same model stack can share blind spots across consecutive blind passes. Document moderate confidence in [research-basis.md](research-basis.md). User can ask for M=3 on high-stakes slices.

Clean streak counts only passes with **no Action findings** from the blind member. Disposing findings as `deferred-to-user` or `declined` does **not** make the pass clean for streak purposes. Soft stop leaves `Closure: open`.

## Adapter-specific matrix

**Code slice:** minimum applicable invariant-matrix rows from fix-loop-ledger.

**Plan section:** scope / gaps / sequencing axes — each marked checked or N/A.

Whole-matrix N/A alone fails under `Thrash: inventory-required`.
