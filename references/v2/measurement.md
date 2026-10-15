# Measurement

<!-- source-of-truth: procedure and verdict rules for any reported performance or metric number -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**Portable ambient reference.** Use it whenever a number will be reported or used to decide something: a before/after, a regression claim, a hill-climb harness, or a choice between options. Answer each question with evidence from a run, not from reading code.

## Before running

- Write the claim sentence you expect to report, for example "export p50 is 30% faster on the 60k-row dataset". The questions below test that sentence.
- Read the measurement script. Note what it times, what it counts and what it ignores.
- Check machine load and core count. If the machine is busy and cannot be quieted, interleave the sides so both see the same noise, and say so.

## Seven questions

1. **Why not double?** Name the limiter (CPU, a lock, disk, network, the load generator) from a profile or counters taken in a run you do not report. Map it to source.
2. **Was every side tuned?** Run each side the way production runs it: release build, production flags, the same data and versions, and caches as warm as production sees them. A side left on defaults means you compared configurations.
3. **Did it break physical limits?** Do the arithmetic. If a piece takes 10% of the run, removing it gives at most about 11%. A result past a limit measured a cache, a no-op or a bug.
4. **Did it error?** Count failures and check output correctness, not only that output exists. Errors are often fast.
5. **Does it reproduce?** Run each side at least 5 times, alternating A, B, A, B. Report the median and range. A gap inside run-to-run variation is no measurable difference.
6. **Does it matter end to end?** Measure the path a user waits on, and report a micro result as a share of the whole.
7. **Did the work happen?** Confirm that the timed region did the work: requests arrived, rows were written, results were used. Lazy code and timeouts produce numbers for work that never ran.

A quick ballpark the user asked for may be one run. It still answers questions 4 and 7, and says it is one run. A choice between options is never a ballpark.

## Verdict

- Lead with one of: **faster**, **slower**, **no measurable difference**, **inconclusive**.
- Give the number with its unit, run count, range and limiter, for example "p50 41 ms → 33 ms, median of 7 runs per side, range 32–35 ms after, bound by JSON parsing on one core".
- The verdict is **inconclusive** when the limiter is unnamed, a side ran untuned, or questions 4 and 7 were not checked. Name the gap.

## Frozen harness

When a loop compares many attempts against one baseline, prove the harness is sensitive first: contrasting workloads must produce separated results. Then freeze it. Do not edit the harness, the workload or the baseline after the first attempt. The harness prints an error count and a work-done count on every run, so each keep-or-revert decision checks questions 4 and 7.

## Attribution

Adapted from the `benchmark-checklist` skill and the `explain-the-number` principle in [pstack](https://github.com/backnotprop/pstack). Copyright (c) 2026 Lauren Tan, MIT License.
