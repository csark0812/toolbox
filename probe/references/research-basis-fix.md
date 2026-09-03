# Diagnose research basis

<!-- source-of-truth: evidence and limits behind tight-loop diagnosis. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-02 -->

Read when calibrating loop-first gates or making a research claim. Not for every debug session.

## Evidence posture

- A reproducible failing signal is an environment **verifier**. Hypotheses are cheap. Loops are expensive to build and worth disproportionate effort.
- Generator–verifier framing from agentic reasoning surveys applies: the loop judges fixes, not narrative confidence.

## Loop as verifier

No on-demand red signal → no hypotheses. The tight loop must be red-capable, deterministic, and fast before production changes.

**Confidence:** High as process discipline for hard bugs. Moderate for catalog ordering as universal truth.

**Does not transfer:** Claiming loop catalog order is empirically optimal for every stack.

- ReAct / tool-feedback loops — environment observation refines action (Yao et al., 2023).
- Reasoner–verifier–refiner taxonomy in LLM reasoning surveys (arXiv:2504.09037).

## Evidence parity

Direct skill-on versus skill-off transfer for diagnose uses `npm run agent:test:diagnose-evidence-parity` (manual cadence). See [evidence-parity.md](https://raw.githubusercontent.com/csark0812/toolbox/main/docs/evidence-parity.md).

| ID  | Claim                                               |
| --- | --------------------------------------------------- |
| D1  | No-repro gate — refuse hypotheses without a signal  |
| D2  | Loop before cause — red test before production edit |
| D3  | Tight loop construction (retired ceiling band)      |

**Confidence:** TBD until N≥3 same-model repeats meet all of these. `full` majority-beats `none` on D1. `full` beats the prompt baseline. Transfer fails classify as invent (not forage-only). Batch `decisionHint` is `invest-more-hygiene` until forensics are clean.

**Does not transfer:** Placeholder until repeated direct parity data exists. Do not claim skill lift from contract scenarios alone.

## Handoff to TDD

Diagnostic instrument ≠ regression spec. Lock the public seam after the mechanism is understood.

**Confidence:** High for separation of concerns. Not a claim about TDD effect sizes.
