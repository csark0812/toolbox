# Multi research basis

**Source of truth for** evidence and limits behind parallel dispatch.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating Fit check, dispatch size, or claiming multi-agent superiority. Not for every spawn.

## Evidence posture

- Equal-budget comparisons matter: multi-agent wins are often extra thinking tokens, not architecture magic.
- Independence must be real — same material with identical prompts is duplication, not coverage.
- Entry-skill carve-outs (staged debate, council escalation) are intentional; do not use this file to skip mandated waves.

## Single-agent rival (Fit check)

Before `N ≥ 2`, name how one agent with a deeper primary pass and more tool use would do the job. Spawn only when independence (different sources, kill mandates, or breadth) cannot be covered in one contiguous context.

**Confidence:** Moderate to high for defaulting to single-pass on sequential or overlapping work. Moderate for when true parallel independence justifies multi.

**Does not transfer:** Tasks that genuinely need adversarial asymmetry or mandatory staged debate — those entry skills own the carve-out.

- Han et al. (2025) and related budget-aware agent comparisons — multi-agent underperforms strong single-agent baselines when thinking tokens are normalized.
- Wang et al. (2024) — inference-scaling vs architectural overhead in agentic workflows.
- Survey: _A Survey of Frontiers in LLM Reasoning_ (arXiv:2504.09037) — generator–verifier and debate patterns; coordination cost as first-order concern.

## Cost is not quality

Higher token spend can masquerade as better architecture. Prefer cheapest good enough per [model-routing.md](model-routing.md); never spawn to look thorough.

**Confidence:** High for cost discipline; moderate for mapping vendor pricing to task fit.

- Anthropic multi-agent research notes (2025) — token usage explained much of performance variance in breadth-first research tasks.

## When independence justifies multi

Coverage across sources, orthogonal research topics, kill-mandate adversarial lenses, and staged debate (entry-skill owned) are legitimate multi shapes.

**Confidence:** Moderate — depends on task decomposition quality, not member count alone.

- Tran et al. (2025) — multi-agent collaboration mechanisms survey: role specialization and communication topology matter; blind spawning does not.
