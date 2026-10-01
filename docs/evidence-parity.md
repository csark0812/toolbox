# Evidence parity

<!-- source-of-truth: paired current evidence and preserved historical reports -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-30 -->

Use npm run agent:test:evidence-parity for probe evidence arms or npm run agent:test:diagnose-evidence-parity for repair arms. Both execute current SDK suites with three repetitions, explicit inputs and independent task sessions. Normalized artifacts record scenario/compare identity, variant, repetition, input context, outcomes and measurements. Missing or failed arms do not form a completed passing pair.

Current parsing lives in scripts/lib/evidence-v2.mjs. scripts/lib/agent-test-artifacts.mjs and old debug readers retain historical formats; do not use old SDK comparison flags for new runs. Compare correctness, interruption/call counts, elapsed time and available provider usage independently. Three pairs provide bounded evidence, not universal superiority. Skill-evolution proposals require review and source validation.
