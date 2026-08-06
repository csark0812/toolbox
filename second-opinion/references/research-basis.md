# Second opinion research basis

**Source of truth for** evidence and limits behind staged plan debate.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating debate shape, anchoring, or claiming MAD benefits. Not for every second-opinion run.

## Evidence posture

- Staged adversarial debate can surface gaps single-pass critique misses — when roles and asymmetry are structured.
- Unconstrained debate drifts off-artifact and can amplify persuasion without truth.
- Context asymmetry (attackers artifact-only; defender with primary sources) is intentional, not unfair.

## Multi-agent debate benefits

Parallel attackers with kill mandates and a defender with related context can break premature confidence on written plans.

**Confidence:** Moderate for plan critique; low for treating debate output as ground truth without primary evidence.

**Does not transfer:** Dialogue without an artifact (use **crystallize** / **grill**); code-path hunches (**investigate**).

- Du et al. (2023). _Improving Factuality and Reasoning in Language Models through Multiagent Debate._ arXiv:2305.14325
- Liang et al. (2023) — debate patterns in reasoning surveys (arXiv:2504.09037).

## Problem drift

Debate that is not anchored to artifact sections wanders; coordinators should tag unanchored kills as `drift`, not convergent.

**Confidence:** Moderate — emerging empirical work on MAD failure modes.

- Becker et al. (2025). _Stay Focused: Problem Drift in Multi-Agent Debate._
- Huang et al. (2026). _Socratic Elenchus-inspired multi-agent debate for mitigating hallucinations in large language models._

## Context asymmetry

Wave-1 attackers see the artifact only; wave-2 defender sees cited primary sources plus structured attacker briefs. Prevents attackers from anchoring on coordinator or parent-chat conclusions.

**Confidence:** Moderate as process hygiene; not a guarantee of correctness.

- [`subagents` adversarial.md](../../subagents/references/adversarial.md) — claim anchoring and kill mandates operationalize drift control.
