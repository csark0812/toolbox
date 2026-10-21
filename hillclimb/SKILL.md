---
name: hillclimb
description: Use when the user wants a number moved to a target - faster, smaller, less memory, quicker tests. Freezes the measurement, tries one change at a time, keeps or reverts, commits each win. Not diagnosing one slow path.
when_to_use: Requests such as "get p95 latency under 200 ms", "make this page load in under a second", "shrink the bundle", "keep making this faster", "the test suite is too slow, speed it up".
---

# Hillclimb

<!-- source-of-truth: target-driven metric improvement through a frozen harness and a logged keep-or-revert loop. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

**Process skill.** Move one number toward a target with attempts that are measured, kept or reverted in full, and logged. This page is enough to run the loop; open a reference only when a rule here is unclear. Measurement rules → [measurement.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/measurement.md). Named principles → [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md). Composition → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md).

Adapted from the pstack hillclimb playbook ([backnotprop/pstack](https://github.com/backnotprop/pstack), MIT © 2026 Lauren Tan).

## Entry gate

1. **Metric and direction.** Name one metric, its unit and direction. When the user gave no target, propose one and confirm it before the first attempt.
2. **Workload.** Find or build a realistic workload that reproduces the complaint. If none reproduces it, stop and report that. Do not climb against a workload that does not show the problem.
3. **Commit authority.** Check the current branch. On `main`, `master` or a shared branch, measure and report, then ask before the first commit. On the user's own feature branch, continue.

## Non-negotiables

- Write the **stop predicate** before the first attempt. It has a target and a minimum attempt count, for example "median ≤ 5 ms and at least 3 attempts". Never relax it. Reaching the target early does not end the loop before the minimum attempt count.
- **Prove the harness is sensitive, then freeze it.** Contrasting workloads must produce separated results. After the baseline, do not edit the harness, its workload, its data or its run count. Each run reports the median of repeated samples, an error count and a work-done count.
- Record a **regression gate** at the baseline: the existing tests or a correctness check that passes before any attempt. Every kept attempt must pass it.
- **Prove results unchanged.** Before the first attempt, build an equivalence check that runs the original and the changed code over many generated inputs, including edge cases and mixed value types, and compares outputs strictly, or with a hash of the full output. Run it at every keep. When it is small, commit it as a test that keeps a frozen copy of the original, so the protection stays in the repository; show once that it fails on a deliberately broken version.
- **Leave a margin.** Do not stop just under the target. Once it is met, remove remaining known costs that are cheap to remove, and finish with every run of the final measurement under the target.
- **Profile before guessing.** Take a profile of the baseline and name the hot path before the first hypothesis. Measure the baseline and the candidate in alternating rounds, so machine drift cannot fake a win.
- **One hypothesis per attempt.** Each names a mechanism. Order the hypotheses cheapest first: avoid the work, avoid repeating it, do less, do it later, do it concurrently, then do it cheaper.
- **Keep or revert in full.** Keep an attempt only when the frozen harness shows a gain beyond run-to-run spread, the error count is zero, the work count is unchanged and the gate passes. Otherwise restore the files it touched. Never claim a win from reading code.
- One commit per kept attempt. Stage only the paths it changed. Never `git add -A` or `git add .`. Never commit the decision log.
- Correctness and simplicity outrank the number. A kept attempt that adds complexity without beating the spread is reverted.
- A plateau changes the hypothesis category. Two attempts in a row that produce no new evidence and no gain route to i-need-help when it is installed. Otherwise stop with the same report inline.

## Tools

Three helpers sit in `<skill>/scripts/`, where `<skill>` is the folder this file was loaded from. Run them; there is no need to read them.

- `node <skill>/scripts/ab.mjs --rounds 5 -- <bench command>`, run from the folder the bench runs in, alternates the bench on `HEAD` and on the working tree and prints three lines: each side's median, range, errors and work, then the delta and whether the ranges separate. `--ref <sha>` compares against another commit, such as the baseline. `--field <name>` picks the JSON field when the first number is not the metric.
- `node --cpu-prof --cpu-prof-dir=<tmp> <bench script>`, then `node <skill>/scripts/hot.mjs <tmp>`, prints the ten hottest functions by self time with file and line.
- `node <skill>/scripts/log.mjs <decisions.tsv> <id> <hypothesis> <change> <before> <after> <delta> <gate> <verdict> <note>` appends one row to the decision log.

## Workflow

Each step below is one response. Every extra round trip re-sends the whole conversation, so batching is the main cost lever and quiet output the second (`npm run -s`, `| tail -3`, a summary-only test reporter). A reader of the log sees only the first line or so of each command, so a measurement chained after an edit is invisible: when a step changes code and then measures, send the change and the measurement as two tool calls in the same response, which run in order. The shell stays in the folder of the last `cd`, so do not `cd` into it again.

1. **Orient.** One command prints every tracked file of a small project, or in a large one the files the metric touches (`cd <project> && for f in $(git ls-files .); do echo "== $f"; cat "$f"; done`) and runs the branch and status, one bench run, the tests and a baseline profile through `hot.mjs`. Before the next step, write one short block in your reply text: metric, direction, target, the stop predicate with its minimum attempt count, gate and hot path.
2. **Set up and first attempt.** First call: write the equivalence test and its frozen copy of the original, run it, break the code on purpose and show the test fails, restore, commit the test, exclude `.hillclimb/` through `.git/info/exclude` when it is not ignored, log the baseline row (`log.mjs .hillclimb/<slug>/decisions.tsv baseline "-" "-" "-" <value> "-" pass baseline "<limiter>"`), then apply the first hypothesis. Second call: `ab.mjs` against `HEAD`, then the gate.
3. **Next attempt.** Read the result. First call opens with the decision's log row (measured before, after and delta), then commits the explicit paths or restores them, then applies the next hypothesis. Second call: `ab.mjs` and the gate. Log reverted attempts too.
4. **Finish** only when the whole predicate holds, minimum attempt count included, or the stall rule fires. First call: the last log row and decision. Second call: `ab.mjs --ref <baseline sha>` for the final numbers (its range is the final spread, so no extra bench runs are needed), the gate, `git status` and `git log --oneline`.

## Exit artifact

Reply with:

- **Result:** baseline → final with unit, run count, range and the limiter now. Lead with **faster**, **slower**, **no measurable difference** or **inconclusive**.
- **Kept:** each commit with its hypothesis and delta.
- **Reverted:** each hypothesis with its measured reason.
- **Predicate:** met or not met, and attempts used.
- **Log:** path to `decisions.tsv`. Keep the log out of commits. If `.git/info/exclude` cannot be written, delete `.hillclimb/` before finishing and paste the table instead. Finish with a clean tree.

**Reply check.** Every result you state names a command that appears in your actions and ran after your last edit: say `node --test` if that is what ran, not `npm test`. Claim a clean tree only after `git status`, and claim a test failed first only when that failing run is shown.

## Consumer bindings

Consumers may name their benchmark command, workloads and gate in a local skill or AGENTS.md. Those bindings choose the harness; they do not relax the non-negotiables.
