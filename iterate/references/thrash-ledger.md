# Coordinator thrash ledger

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Coordinator-only memory across blind passes. **Never** forward this ledger to the blind reviewer.

Theme identity vocabulary → [fix-loop-ledger.md](fix-loop-ledger.md) (theme_id, invariant matrix, premature closure, sibling mint). Thrash signals → [anti-thrash.md](anti-thrash.md).

## K-round window

Maintain rolling summaries for the last **K=3** completed review rounds:

| Field      | Content                                      |
| ---------- | -------------------------------------------- |
| `round`    | Pass number                                  |
| `themes`   | `theme_id` list with one-line invariant each |
| `claims`   | Anchored finding claims only — no fix prose  |
| `cohesion` | `attested-local` \| `not-attested`           |

Drop rounds older than K from active thrash comparison. Theme families may persist in coordinator notes until `Closure: ready`.

## Thrash signals

When any is true after a blind pass returns:

1. Same `theme_id` family reopened across rounds in the K window.
2. **Sibling mint** — new Action theme when K-window archaeology already recovered a parent for that hotspot/class → protocol error; reopen parent ([fix-loop-ledger § Sibling mint](fix-loop-ledger.md#predicate-glossary)).
3. Adjacent matrix edge of a recently attested-local theme fails — **premature closure**; reopen existing `theme_id`.
4. Two+ Action blockers same invariant family on one pass.

Then:

- Set header `Thrash: inventory-required` ([output.md](output.md)).
- Pause filing further sibling Action themes for that family.
- Apply gravity-aware fix: extend invariant + sweep surfaces — not symptom patch.

## Gravity rules

| Situation                        | Coordinator action                                                   |
| -------------------------------- | -------------------------------------------------------------------- |
| Same invariant, new edge         | Reopen existing `theme_id`; extend matrix checklist                  |
| Genuinely different invariant    | New `theme_id`; one-line why prior passes missed it                  |
| Low reachability / polish        | Noted or Deferred — not Action unless user opted in                  |
| High-dimensional contract thrash | Matrix pass required before next attested-local counts toward streak |

## Persistence

No durable ledger files (`_agent/review/` etc.) during the loop. Optional: `Theme:` in fix commit messages and PR body identity lines — same hygiene as code-review Continuity persistence.

## After exit

On `Closure: ready`, omit thrash footer. Delete any stale review ledger files from older workflows if present — do not write new ones.
