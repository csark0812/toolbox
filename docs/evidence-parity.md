# Evidence parity

<!-- source-of-truth: paired skill-on and skill-off conformance evidence -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

Evidence parity runs the same scenario with the skill installed (outcomes arm) and without it (prompt and transfer arms), three times each, and compares the normalized results. Use `npm run agent:test:evidence-parity` for the probe evidence family and `npm run agent:test:debugging-evidence-parity` for the `evidence-based-debugging*` family.

Each run writes `normalized.json` with the scenario and compare identity, variant, repetition, inputs, outcome and measurements. `scripts/lib/evidence-v2.mjs` validates and groups those records. Missing or failed arms never form a passing pair. Compare correctness, tool-call counts, elapsed time and provider usage separately. Three pairs are bounded evidence, not proof of superiority.

Parity answers "does the skill change pass/fail behavior on fixed claims". To decide whether a skill produces better work than its baseline, use the blinded pairwise [skill bench](skill-bench.md).

The debugging family compares two identities, `insufficient-evidence` and `demonstrated-repair`. Compare only runs made from the same contract and inputs.
