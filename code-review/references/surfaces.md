# Surface bands

How **deep** the primary reviewer goes and whether escalation is **eligible**. Measured **within the asked scope** after the source adapter runs ([sources.md](sources.md)).

## Measurement (soft composite)

1. **Resolve scope** — user-named paths/theme, else full adapter surface.
2. **Measure bulk** — code files + changed LOC in scope. Exclude `docs/`, skill trees, and agent entry files from bulk counts (same carve-out as legacy Full promotion). Mass deletes and trusted generated-only refactors are **bulk-light** (Google small-CL exception).
3. **Assign band** — guides primary intensity, not spawn (see table).
4. **Risk flags** — auth, payments, privacy, security, API/schema/public contract in scope → deepen **primary** evidence bar; may bump band **one notch** for attention. Risk alone does **not** force specialist Tasks.
5. **Explicit intensity** — user `quick`, `exhaustive`, `council`, `focus on <paths>` beats the measured band for intensity/scope/escalation only — not filing ([merge-blockers.md](merge-blockers.md)) or evidence standards.

Log in header: `Surface: focused|standard|broad (N files, M loc)` · `Reviewer: primary|primary+specialists|council`.

## Soft bands (portable defaults)

| Band         | Guide (within scope)                       | Primary pass                                      | Escalation eligibility                                                                   |
| ------------ | ------------------------------------------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Focused**  | ≤ ~200 LOC, few files, single theme        | Tight primary                                     | Rare                                                                                     |
| **Standard** | ~200–400 LOC or coherent multi-file change | Full primary evidence pass                        | Only if unresolved after direct inspection                                               |
| **Broad**    | > ~400 LOC or ≥ ~20 files or multi-theme   | Primary deep + note decomposition / residual risk | _Consider_ Fit-checked specialists; council only on user ask or cross-cutting unresolved |

Anchors: Bosu et al. (usefulness drops ≥ ~20 files); Google small-CL guidance (~100–1000 LOC as judgment, not hard gates). Bands are **guides** — conceptual coherence matters more than LOC alone.

## User overrides (intensity only)

| User says                            | Effect                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `quick` / `focused pass`             | Clamp to Focused primary even on larger bulk                                         |
| `exhaustive` / improvements triggers | Second primary pass + improvements filing per [merge-blockers.md](merge-blockers.md) |
| `council` / `multi-agent`            | Jump to council rung — [escalation.md](escalation.md)                                |
| `focus on <paths>`                   | Re-resolve scope to paths; re-measure band on that slice                             |

## Re-review (fix-loop)

When [anti-thrash.md](anti-thrash.md) classifies `closure-re-review`:

- **Whole-surface bulk must not** promote to council on size alone.
- Stay **primary** targeted closure; optional Quick (1) specialist only if primary cannot settle a hotspot.
- Header records `Pass class: closure-re-review` · `Pass: targeted contextual` and size carve-out when applicable — [output.md](output.md).

Contextual re-review rules (targeted vs Full contextual) live in [fix-loop-ledger.md](fix-loop-ledger.md) and [anti-thrash.md](anti-thrash.md); they apply on **any** source adapter.
