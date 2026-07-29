# Diagnose research basis

**Source of truth for** evidence and limits behind tight-loop diagnosis.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating loop-first gates or making a research claim. Not for every debug session.

## Evidence posture

- A reproducible failing signal is an environment **verifier** — hypotheses are cheap; loops are expensive to build and worth disproportionate effort.
- Generator–verifier framing from agentic reasoning surveys applies: the loop judges fixes, not narrative confidence.

## Loop as verifier

No on-demand red signal → no hypotheses. The tight loop must be red-capable, deterministic, and fast before production changes.

**Confidence:** High as process discipline for hard bugs; moderate for catalog ordering as universal truth.

**Does not transfer:** Claiming loop catalog order is empirically optimal for every stack.

- ReAct / tool-feedback loops — environment observation refines action (Yao et al., 2023).
- Reasoner–verifier–refiner taxonomy in LLM reasoning surveys (arXiv:2504.09037).

## Handoff to TDD

Diagnostic instrument ≠ regression spec; [`tdd`](../tdd/SKILL.md) locks the seam after the mechanism is understood.

**Confidence:** High for separation of concerns; not a claim about TDD effect sizes.
