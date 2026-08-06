# Subagents research basis

**Source of truth for** evidence and limits behind subagent dispatch.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Read when calibrating when-not-to-spawn, dispatch size, or claiming multi-agent superiority. Not for every spawn.

## Evidence posture

- Equal-budget comparisons matter: multi-agent wins are often extra thinking tokens, not architecture magic.
- Entry-skill carve-outs (staged debate, council escalation, blind review) are intentional; do not use this file to skip mandated waves.
- Cheapest good-enough routing (Auto first) reduces waste without sacrificing independence where it matters.

## Single-agent rival (when-not-to-spawn)

Before `N ≥ 2`, a single coordinator pass with deeper tool use often matches or beats parallel spawn on overlapping slices.

**Confidence:** Moderate to high for defaulting to single-pass on sequential or overlapping work. Moderate for when true parallel independence justifies parallel members.

**Does not transfer:** Tasks that genuinely need adversarial asymmetry or mandatory staged debate — those entry skills own the carve-out.

- Han et al. (2025) and related budget-aware agent comparisons — multi-agent underperforms strong single-agent baselines when thinking tokens are normalized.

## Token cost discipline

Parallel `*-fast` variants and premium slugs multiply cost without adding independence. Default Auto / `inherit-auto` for parallel members.

**Confidence:** High for anti-fast parallel rule; moderate for exact price ratios across hosts.

- Cursor models & pricing docs — throughput fast vs regular intelligence equivalence at higher token price.

## When independence justifies parallel dispatch

Coverage across sources, orthogonal research topics, kill-mandate adversarial lenses, and staged debate (entry-skill owned) are legitimate parallel shapes.

**Confidence:** Moderate.

- Tran et al. (2025) — multi-agent collaboration mechanisms survey: role specialization and communication topology matter; blind spawning does not.

## Problem drift

Debate or review that is not anchored to artifact sections wanders; coordinators should tag unanchored kills as drift.

**Confidence:** Moderate.

- Becker et al. (2025). _Stay Focused: Problem Drift in Multi-Agent Debate._
