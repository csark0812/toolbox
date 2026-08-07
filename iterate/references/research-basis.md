# Iterate research basis

**Source of truth for** evidence and limits behind blind iterative closure.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Read when calibrating blindness, exit gates, or claiming iterate benefits. Not for every pass.

## Evidence posture

- Fresh-context review passes can reduce anchoring on prior synthesis — when context packs exclude prior pass text (context asymmetry).
- Prompt-only blindness is **not** cryptographic isolation. Updated slice materials can encode prior conclusions without quoting earlier reviews.
- Layered exit (matrix + attested-local + streak + coordinator closure) targets premature closure better than a single "no findings" pass.

## Blind passes as bias reduction

Memoryless subagent review trades coordinator continuity for reduced confirmation bias on the same slice.

**Confidence:** Moderate as process hygiene. Low as guarantee that two blind passes equal two independent human reviewers.

**Does not transfer:** Claiming replay CI proves Task spawn or prompt isolation (transcript markers only).

- [`subagents` adversarial.md](../../subagents/references/adversarial.md) — context asymmetry operationalizes attacker/defender isolation patterns.

## Clean streak (M=2)

Consecutive no-Action blind passes reduce one-pass false green.

**Confidence:** Moderate for catching single-pass luck. Low for same-model shared blind spots across passes.

**Does not transfer:** M=2 as universal constant for all slice complexity — user can raise M on high-stakes invariants.

## Thrash delegation

Theme identity and premature closure vocabulary → [fix-loop-ledger.md](fix-loop-ledger.md) and [anti-thrash.md](anti-thrash.md) in this skill.

**Confidence:** High for SSOT maintenance. Moderate that cross-skill links are followed without coordinator discipline.

## Problem drift

Iterative loops without thrash guards re-file adjacent edges as sibling themes.

**Confidence:** Moderate — see [anti-thrash.md](anti-thrash.md).

## Novel-theme / diminishing-returns thrash

Same-family reopen guards miss loops that mint a **new** `theme_id` every round after a clean pass. That pattern shows up in plan densification and contract-edge polish. Observed on long plan-section iterate runs: early rounds structural. Late rounds flip clean ↔ micro-Action and never hold streak M.

**Mitigation:** coordinator novelty thrash → soft stop (`Closure: open`, no auto N+1) plus explicit `deferred-to-user` disposition — not fixed round budgets ([thrash-ledger.md](thrash-ledger.md) · [exit-gate.md](exit-gate.md)).

**Confidence:** Moderate for the failure mode. Moderate that soft stop beats lowering M or auto-ready on deferred leftovers.
