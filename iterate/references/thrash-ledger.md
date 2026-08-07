# Coordinator thrash ledger

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Coordinator-only memory across blind passes. **Never** forward this ledger to the blind reviewer.

Theme identity vocabulary → [fix-loop-ledger.md](fix-loop-ledger.md) (theme_id, invariant matrix, premature closure, sibling mint). Thrash signals → [anti-thrash.md](anti-thrash.md). Soft stop / dispositions → [protocol.md](protocol.md) · [exit-gate.md](exit-gate.md) · [output.md](output.md).

## K-round window

Maintain rolling summaries for the last **K=3** completed review rounds:

| Field      | Content                                      |
| ---------- | -------------------------------------------- |
| `round`    | Pass number                                  |
| `themes`   | `theme_id` list with one-line invariant each |
| `claims`   | Anchored finding claims only — no fix prose  |
| `cohesion` | `attested-local` \| `not-attested`           |
| `action`   | Action finding count (member-reported)       |

Drop rounds older than K from active thrash comparison. Theme families can persist in coordinator notes until `Closure: ready` or user soft-stop resolution.

Also track (coordinator notes, not forwarded): whether any prior pass in this loop was **clean** (`Action: 0` + `Cohesion: attested-local`).

## Thrash signals

### Inventory thrash (`Thrash: inventory-required`)

When any is true after a blind pass returns:

1. Same `theme_id` family reopened across rounds in the K window.
2. **Sibling mint** — new Action theme when K-window archaeology already recovered a parent for that hotspot/class → protocol error. Reopen parent ([fix-loop-ledger § Sibling mint](fix-loop-ledger.md#predicate-glossary)).
3. Adjacent matrix edge of a recently attested-local theme fails — **premature closure**. Reopen existing `theme_id`.
4. Two+ Action blockers same invariant family on one pass.

Then:

- Set header `Thrash: inventory-required` ([output.md](output.md)).
- Pause filing further sibling Action themes for that family.
- Apply gravity-aware fix: extend invariant + sweep surfaces — not symptom patch.

### Novelty / diminishing-returns thrash (`Thrash: diminishing-returns`)

**No fixed round budgets.** Fire when either holds after a blind pass returns:

1. **Post-clean novelty** — this loop already had ≥1 clean pass (`Action: 0` + `attested-local`). This pass’s Action `theme_id`s are **all new** vs the K-window (no reopen of an existing family).
2. **Novel plateau** — the last **3** Action rounds (Action > 0) each introduced only novel `theme_id`s (no family reopen). Action count is ≤ the prior Action round’s count.

Then:

- Set header `Thrash: diminishing-returns`.
- **Soft stop** — emit pass progress + Iterate summary with `Closure: open`. **Must not** spawn pass N+1 until the user says continue ([exit-gate.md](exit-gate.md) § Soft stop). Soft stop ≠ `Closure: ready`.
- Still classify every finding under Worth acting (`acted` | `deferred-to-user` | `declined`). Do not silently drop.

## Gravity rules

| Situation                        | Coordinator action                                                               |
| -------------------------------- | -------------------------------------------------------------------------------- |
| Same invariant, new edge         | Reopen existing `theme_id`. Extend matrix checklist                              |
| Adjacent edge of covered family  | Prefer reopen parent + Noted edge over minting a new kebab (**family collapse**) |
| Genuinely different invariant    | New `theme_id`. One-line why prior passes missed it                              |
| Low reachability / polish        | Noted or `declined` — not Action unless user opted in                            |
| User judgment needed             | `deferred-to-user` — surface in progress. Soft-stop for ask (do not silent-drop) |
| High-dimensional contract thrash | Matrix pass required before next attested-local counts toward streak             |
| Post-clean novelty thrash        | Soft stop. Do not auto-fix+reloop novel themes                                   |

## Persistence

No durable ledger files (`_agent/review/` and similar) during the loop. Optional: `Theme:` in fix commit messages and PR body identity lines — same hygiene as code-review Continuity persistence.

## After exit

On `Closure: ready`, omit thrash footer. Delete any stale review ledger files from older workflows if present — do not write new ones. Soft-stopped loops keep thrash visible until the user continues or stops.
