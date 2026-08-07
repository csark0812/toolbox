# TDD research basis

**Source of truth for** evidence and limits behind test-first implementation at seams.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Read when calibrating a move or making a research claim. Not for every red-green slice.

## Evidence posture

- This skill enforces **process discipline** at agreed public seams. It is not a claim that TDD improves velocity or defect rates in all contexts.
- Agent-generated tests can be tautological or implementation-coupled. Anti-patterns in [`anti-patterns.md`](anti-patterns.md) are the guardrail.

## Red before green

One vertical slice: failing test from independent expected values, then minimal green. No bulk tests or speculative features.

**Confidence:** High for microcycle ordering as a discipline. Moderate for agent adherence under time pressure.

**Does not transfer:** Claiming red-green order guarantees better design without seam quality.

- Mathews & Nagappan (2024). Test-Driven Development and LLM-Based Code Generation.
- Fucci et al. (2015). Towards an operationalization of test-driven development skills.

## Seam confirmation

Tests only at user-confirmed public boundaries. If the seam is unclear, grill or probe (Evidence) first.

**Confidence:** High for avoiding implementation-coupled tests. Not a substitute for domain modeling.

**Does not transfer:** Testing private helpers because they are easier to reach.

## Handoff from probe Fix

Diagnostic loop proves the bug. TDD locks regression at an agreed seam — different jobs.

**Confidence:** High for separation of concerns.

**Does not transfer:** Using the diagnostic test unchanged as the long-term regression spec without seam review.
