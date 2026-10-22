---
name: hillclimb
description: Use when the user wants a number moved to a target - faster, smaller, less memory, quicker tests. Freezes the measurement, tries one change at a time, keeps or reverts, commits each win. Not diagnosing one slow path.
when_to_use: Requests such as "get p95 latency under 200 ms", "make this page load in under a second", "shrink the bundle", "keep making this faster", "the test suite is too slow, speed it up".
---

# Hillclimb

<!-- source-of-truth: target-driven metric improvement through a frozen harness and a logged keep-or-revert loop. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-23 -->

**Process skill.** Move one number to a target with measured attempts, each committed or reverted in full. Measurement → [measurement.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/measurement.md). Principles → [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md). Composition → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md). Adapted from pstack hillclimb ([backnotprop/pstack](https://github.com/backnotprop/pstack), MIT © 2026 Lauren Tan).

## Entry gate

1. **Metric and target.** One metric, its unit and direction. No target given: propose one and ask before changing code.
2. **Workload.** The bench must reproduce the complaint. If it does not, stop and say so.
3. **Branch.** On `main`, `master` or a shared branch, measure and report, then ask before committing. On the user's feature branch, continue.

## Rules

- **Stop rule.** Stop when the kept code meets the target with margin in the last A/B: every run under it and the median at or below 0.6× it, or one stalled run and the median at or below 0.4× (`--target` checks it). Then change nothing more; `ab.mjs` reverts any later change. At most 5 attempts. Two attempts in a row with no gain: change the kind of hypothesis, or stop and report (through i-need-help when installed). Never relax the target.
- **Frozen harness.** After the baseline, never edit the bench, its workload, its data or its run count.
- **Equivalence test.** Before attempt 1, commit a test that compares the code with a frozen copy of the original over generated inputs with edge cases and mixed types, strictly or by a hash of the full output. The frozen copy lives with the tests, never as a source module. Keep it under 1 s. Show it failing once on a deliberately broken version (break, run, restore in one command).
- **One hypothesis per attempt**, naming its mechanism, cheapest first: avoid the work, avoid repeating it, do less, do it cheaper. A memo table lives inside one call; a cache that outlives the call flatters repeated runs and is not a win.
- **Keep or revert in full.** Keep only on a keep verdict (gain beyond the spread, no errors, same work, gate passing). `ab.mjs --change "<paths>" --commit "<message>"` does either: one commit per kept attempt, explicit paths only, measured delta in the subject. Commit nothing beyond the test and the kept changes. Never `git add -A` or `.`; never commit `.hillclimb/`.
- **Measure only with `ab.mjs`; profile at baseline only** (orient does it), again only when a kept attempt misses the target.

## Tools

Run these from `<skill>/scripts/`, the folder this file was loaded from; no need to read them.

- `node <skill>/scripts/orient.mjs <project> -- <bench cmd>` prints the files, git state, one bench run, the tests, the hottest functions and HEAD.
- `node <skill>/scripts/ab.mjs --dir <project> --target <n> --gate "<test cmd>" --change "<paths>" --commit "<message>" --log .hillclimb/<slug>/decisions.tsv --id <id> --hyp "<hypothesis>" -- <bench cmd>` runs HEAD (or `--ref baseline`) and the working tree in alternating rounds, 3 to 9 as the spread needs, then the gate. It prints medians, ranges, delta, the target check and the verdict, then commits or reverts and logs the row. With `--finish`, once the target is met it also prints the comparison with the baseline, the git status and the commits since: the final evidence.

## Steps

Each step is one response. Several tool calls in one response cost one round trip. Give each measurement its own tool call so it shows in the record. Use absolute paths and `git -C <project>`, never `cd`. End a command that should fail with `; echo exit=$?` so the calls after it still run.

1. **Orient:** your first call after loading is `orient.mjs`; it lists the files, so no `ls` or `cat` first. Then write one short block: metric, target, stop rule, gate, and what dominates the cost in the profile.
2. **Set up, attempt 1, measure:** write and run the equivalence test; show its failure; commit it; apply hypothesis 1; `ab.mjs --commit --finish`. Target met: reply.
3. **Only if the target is not met:** apply the next hypothesis; `ab.mjs --commit --finish` again. When attempts run out, finish with `ab.mjs --ref baseline` and `git status --short`. Then no more bench runs.
4. **Reply** in the user's words. Open with the result: the number from baseline → final with unit, range and run count, against their target, and **faster**, **slower**, **no measurable difference** or **inconclusive**. Then each kept change with its measured delta, each reverted one with its measured reason, the equivalence test and the failure it showed, and what limits the number now. Never name these rules, scripts, verdicts or logs. Every number comes from a command that ran after your last edit. Claim a clean tree only after `git status`.

Consumer bindings may name the bench, workloads and gate; they do not relax these rules.
