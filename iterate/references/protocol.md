# Iterate protocol

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

End-to-end loop for bounded slice closure. Spawn invariants → via subagents.

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

Recipe carve-out applies: when-not-to-spawn waived (via subagents § When-not-to-spawn).

### 3 — Synthesize pass

Merge member output into [output.md](output.md) shape. Run thrash preflight against [thrash-ledger.md](thrash-ledger.md) **after** subagent returns.

Required coordinator reading when thrash may apply:

- [`code-review` anti-thrash.md](../../code-review/references/anti-thrash.md) — thrash signals
- [`code-review` fix-loop-ledger.md](../../code-review/references/fix-loop-ledger.md) — premature closure, theme identity, invariant matrix

### 4 — Fix (when Action > 0)

Coordinator implements fixes directly (same as `code-review` fix-loop). Update:

- K-round ledger (claims-only summaries)
- `Clean streak` counter (reset on Action)
- `Theme:` lines in fix commits when useful for continuity

Re-run repo validation when the consumer defines an authoritative lane.

### 5 — Re-loop or exit

- **Action findings** → return to phase 2 on the **same envelope** (expand envelope only when user widens scope).
- **No Action** → increment clean streak; evaluate [exit-gate.md](exit-gate.md).

When continuing to another blind pass, emit the [between-pass bridge](output.md#between-pass-bridge-required-before-next-blind-subagent) (3–4 sentences: what happened + why it matters for slice closure) **before** phase 2 dispatch. Skip on the first pass and when emitting final `Closure: ready`.

Forbidden: emit `Closure: ready` when any exit layer fails.

## Pass numbering

Round = one blind Task + coordinator synthesis. Ledger stores last **K=3** rounds ([thrash-ledger.md](thrash-ledger.md)).

## Honesty scope

Contract replay suites verify **transcript protocol markers** only — not Task spawn proof or prompt isolation. Blindness is enforced by dispatch rules and forbidden inputs, aligned with via subagents adversarial context asymmetry.
