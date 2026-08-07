# Iterate protocol

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

End-to-end loop for bounded slice closure. Spawn invariants → [`subagents`](../../subagents/SKILL.md).

## Phases

### 1 — Derive envelope

User names intent; coordinator expands via repo read → explicit slice block ([slice-envelope.md](slice-envelope.md)). Log adapter (code | plan-section).

Do not start blind review until the envelope is written in the synthesis header (`Slice:`).

### 2 — Blind review (mandatory Task)

Before any pass synthesis:

1. Write dispatch plan per [blind-reviewer-dispatch.md](blind-reviewer-dispatch.md).
2. Spawn **one** Task/Subagent member (`stance=blind`).
3. Wait for member output.

**Hard gate:** Do not emit pass findings, `Cohesion: attested-local`, or `Closure: ready` without a completed Task run for **this** pass. Coordinator-only reading of the slice is a **violation** — not an optimization.

Entry-skill carve-out applies: when-not-to-spawn waived ([`subagents` SKILL.md](../../subagents/SKILL.md) § When-not-to-spawn).

### 3 — Synthesize pass

Merge member output into [output.md](output.md) shape. Run thrash preflight against [thrash-ledger.md](thrash-ledger.md) **after** subagent returns (inventory thrash **and** novelty / diminishing-returns).

Required coordinator reading when thrash may apply:

- [anti-thrash.md](anti-thrash.md) — inventory thrash signals
- [fix-loop-ledger.md](fix-loop-ledger.md) — premature closure, theme identity, invariant matrix
- [thrash-ledger.md](thrash-ledger.md) — novelty thrash + soft stop

**Family collapse:** before minting a new Action `theme_id`, map the claim onto an existing K-window family when it is an adjacent edge (Locked P / exit-vocab / phase-ownership / soft-exit for plan-section; open invariant matrix for code). Prefer reopen parent over a new kebab.

### 4 — Disposition and fix

Still classify **every** Action finding. Worth acting verbs ([output.md](output.md)):

| Disposition        | Meaning                                                            |
| ------------------ | ------------------------------------------------------------------ |
| `acted`            | Coordinator implements the fix now                                 |
| `deferred-to-user` | Needs user judgment — soft-stop; do not silent-drop or auto-reloop |
| `declined`         | Out of bar / not worth acting — explicit one-clause why            |

When `acted`: implement fixes (same as `code-review` fix-loop). Update:

- K-round ledger (claims-only summaries)
- `Clean streak` counter (reset on Action findings from the member)
- `Theme:` lines in fix commits when useful for continuity

Re-run repo validation when the consumer defines an authoritative lane.

Do **not** auto-defer-all polish after a clean pass — classify each finding. Novelty thrash may still soft-stop auto-reloop.

### 5 — Pass progress, then re-loop, soft stop, or exit

After Disposition for this round, emit the [pass progress](output.md#pass-progress-required-after-every-blind-task) report. Blind members stay memoryless; this report is the user’s subagent-by-subagent continuity.

Then decide:

| Condition                                                          | Next                                                                                   |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `Thrash: diminishing-returns` **or** any `deferred-to-user`        | **Soft stop** — `Closure: open`; **must not** spawn N+1 ([exit-gate.md](exit-gate.md)) |
| `acted` findings, no novelty thrash, no pending `deferred-to-user` | Return to phase 2 on the **same envelope**                                             |
| No Action findings                                                 | Increment clean streak; evaluate [exit-gate.md](exit-gate.md)                          |

When continuing, progress for round N lands **before** spawning pass N+1. Do not skip progress on round 1 or on the final round before `Closure: ready`.

Forbidden:

- Emit `Closure: ready` when any exit layer fails.
- Auto-spawn N+1 after soft stop.
- Treat soft stop as `Closure: ready`.

## Pass numbering

Round = one blind Task + coordinator synthesis. Ledger stores last **K=3** rounds ([thrash-ledger.md](thrash-ledger.md)). No fixed round budget — stop on signals, not a counter.

## Honesty scope

Contract replay suites verify **transcript protocol markers** only — not Task spawn proof or prompt isolation. Blindness is enforced by dispatch rules and forbidden inputs, aligned with [`subagents` adversarial context asymmetry](../../subagents/references/adversarial.md).
