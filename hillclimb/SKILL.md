---
name: hillclimb
description: Improve one measured metric toward a stated target (latency, throughput, bundle size, memory, test time) through a frozen measurement harness and a logged keep-or-revert loop, one hypothesis per attempt. Use when the user asks to get a number under or over a target, or to keep making something faster or smaller. Not diagnosing why one path is slow (evidence-based-debugging), unmeasured cleanup (refactor-companion), or merging.
---

# Hillclimb

<!-- source-of-truth: target-driven metric improvement through a frozen harness and a logged keep-or-revert loop. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**Process skill.** Move one number toward a target with attempts that are measured, kept or reverted in full, and logged. Measurement rules → [measurement.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/measurement.md). Named principles → [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md). Composition → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md).

Adapted from the pstack hillclimb playbook ([backnotprop/pstack](https://github.com/backnotprop/pstack), MIT © 2026 Lauren Tan).

## Entry gate

1. **Metric and direction.** Name one metric, its unit and direction. When the user gave no target, propose one and confirm it before the first attempt.
2. **Workload.** Find or build a realistic workload that reproduces the complaint. If none reproduces it, stop and report that. Do not climb against a workload that does not show the problem.
3. **Commit authority.** Check the current branch. On `main`, `master` or a shared branch, measure and report, then ask before the first commit. On the user's own feature branch, continue.

## Non-negotiables

- Write the **stop predicate** before the first attempt. It has a target and a minimum attempt count, for example "p50 ≤ 40 ms and at least 5 attempts". Never relax it. Reaching the target early does not end the loop before the minimum attempt count.
- **Prove the harness is sensitive, then freeze it.** Contrasting workloads must produce separated results. After the baseline, do not edit the harness, its workload, its data or its run count. Each run reports the median of repeated samples, an error count and a work-done count.
- Record a **regression gate** at the baseline: the existing tests or a correctness check that passes before any attempt. Every kept attempt must pass it.
- **One hypothesis per attempt.** Each names a mechanism. Order the hypotheses cheapest first: avoid the work, avoid repeating it, do less, do it later, do it concurrently, then do it cheaper.
- **Keep or revert in full.** Keep an attempt only when the frozen harness shows a gain beyond run-to-run spread, the error count is zero, the work count is unchanged and the gate passes. Otherwise restore the files it touched. Never claim a win from reading code.
- One commit per kept attempt. Stage only the paths it changed. Never `git add -A` or `git add .`. Never commit the decision log.
- Correctness and simplicity outrank the number. A kept attempt that adds complexity without beating the spread is reverted.
- A plateau changes the hypothesis category. Two attempts in a row that produce no new evidence and no gain route to i-need-help when it is installed. Otherwise stop with the same report inline.

## Workflow

1. Pass the entry gate. State metric, direction, target, stop predicate and gate in one short block.
2. Build or locate the harness. Answer the seven questions in measurement.md for the baseline. Freeze the harness.
3. Start the decision log: `node <installed-skill>/scripts/log.mjs .hillclimb/<slug>/decisions.tsv baseline "-" "-" "-" <value> "-" pass baseline "<limiter>"`. Exclude `.hillclimb/` from Git through `.git/info/exclude` when it is not ignored.
4. Loop: read the log, pick the next hypothesis, change only what it needs, measure with the frozen harness, run the gate, keep or revert, log the row. Log reverted attempts too.
5. Stop when the predicate holds or the stall rule fires.

## Exit artifact

Reply with:

- **Result:** baseline → final with unit, run count, range and the limiter now. Use the verdict words from measurement.md.
- **Kept:** each commit with its hypothesis and delta.
- **Reverted:** each hypothesis with its measured reason.
- **Predicate:** met or not met, and attempts used.
- **Log:** path to `decisions.tsv`.

## Consumer bindings

Consumers may name their benchmark command, workloads and gate in a local skill or AGENTS.md. Those bindings choose the harness; they do not relax the non-negotiables.
