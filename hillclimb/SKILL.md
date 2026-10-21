---
name: hillclimb
description: Use when the user wants a number moved to a target - faster, smaller, less memory, quicker tests. Freezes the measurement, tries one change at a time, keeps or reverts, commits each win. Not diagnosing one slow path.
when_to_use: Requests such as "get p95 latency under 200 ms", "make this page load in under a second", "shrink the bundle", "keep making this faster", "the test suite is too slow, speed it up".
---

# Hillclimb

<!-- source-of-truth: target-driven metric improvement through a frozen harness and a logged keep-or-revert loop. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

**Process skill.** Move one number to a target with measured attempts, each committed or reverted in full. Measurement → [measurement.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/measurement.md). Principles → [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md). Composition → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md). Adapted from pstack hillclimb ([backnotprop/pstack](https://github.com/backnotprop/pstack), MIT © 2026 Lauren Tan).

## Entry gate

1. **Metric and target.** One metric, its unit and direction. No target given: propose one and ask before changing code.
2. **Workload.** The bench must reproduce the complaint. If it does not, stop and say so.
3. **Branch.** On `main`, `master` or a shared branch, measure and report, then ask before committing. On the user's feature branch, continue.

## Rules

- **Stop rule.** Stop when the kept code's runs in the last A/B are all under the target and their median is at or below 0.6× the target (`--target` prints it). If the first kept attempt already meets it, make exactly one cheap follow-up attempt, then stop. At most 5 attempts. Two attempts in a row with no gain and no new evidence: change the kind of hypothesis, or stop and report (through i-need-help when installed). Never relax the target.
- **Frozen harness.** After the baseline, never edit the bench, its workload, its data or its run count.
- **Equivalence test.** Before attempt 1, commit a test that compares the code with a frozen copy of the original over generated inputs, edge cases and mixed types included, strictly or by a hash of the full output. Keep it under about 1 s. Show it failing once on a deliberately broken version.
- **One hypothesis per attempt**, naming its mechanism, cheapest first: avoid the work, avoid repeating it, do less, do it cheaper. A memo table lives inside one call; a cache that outlives the call flatters repeated runs and is not a win.
- **Keep or revert in full.** Keep only on `verdict: keep` (gain beyond the spread, no errors, same work, gate passing); otherwise restore the paths. `ab.mjs --change "<paths>" --commit "<message>"` does either: one commit per kept attempt, explicit paths only, measured delta in the subject. Never `git add -A` or `.`; never commit `.hillclimb/`.
- **Profile at baseline only** (orient does it). Profile again only when a kept attempt misses the target.

## Tools

Run these from `<skill>/scripts/`, the folder this file was loaded from; no need to read them.

- `node <skill>/scripts/orient.mjs <project> -- <bench cmd>` prints the files, branch, status, one bench run, the tests, the five hottest functions and the HEAD sha.
- `node <skill>/scripts/ab.mjs --dir <project> --target <n> --gate "<test cmd>" --change "<paths>" --commit "<message>" --log .hillclimb/<slug>/decisions.tsv --id <id> --hyp "<hypothesis>" -- <bench cmd>` runs HEAD (or `--ref baseline`) and the working tree in alternating rounds, 3 to 9 as the spread needs, then the gate. It prints medians, ranges, delta, the stop rule and the verdict, commits or reverts, and logs the row (the baseline row too, on first use). Repeat comparisons reuse cached side-A runs. With `--finish`, once the stop rule holds it also compares the result with the baseline and prints the git status and the commits since: the final evidence.

## Steps

Each step is one response. Several tool calls in one response cost one round trip; every new response re-sends the whole conversation. Give each measurement its own tool call so it shows in the record. Use absolute paths and `git -C <project>`, never `cd`. End a command that should fail with `; echo exit=$?` so the calls after it still run.

1. **Orient:** your first call after loading is `orient.mjs`; it lists the files, so no `ls` or `cat` first. Then write one short block: metric, target, stop rule, gate, and what dominates the cost in the profile.
2. **Set up, attempt 1, measure:** write the equivalence test and frozen copy; run it; break the code, show the failure, restore; commit the test; apply hypothesis 1; `ab.mjs --commit`, which decides.
3. **Attempt 2, measure, finish:** apply hypothesis 2; `ab.mjs --commit --finish`. If the stop rule does not hold yet, repeat with the next attempt; when attempts run out, finish by hand with `ab.mjs --ref baseline` and `git status --short`. After the final comparison, no more bench runs, loops or profiles.
4. **Reply** in plain words, without log internals: **faster**, **slower**, **no measurable difference** or **inconclusive**; baseline → final with unit, range and run count; each kept change with its measured delta; each reverted change with its measured reason; the equivalence test and the failure it showed; what limits the number now; the log path. Every number comes from a command that ran after your last edit. Claim a clean tree only after `git status`.

Consumer bindings may name the bench, workloads and gate; they do not relax these rules.
