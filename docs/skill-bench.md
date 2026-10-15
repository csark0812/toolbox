# Skill bench

<!-- source-of-truth: blinded pairwise benchmark that decides whether a skill beats its baseline -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

A skill ships or stays only if it beats its baseline in this bench. Conformance suites prove that a skill is followed. The bench asks whether following it produces better work.

## How it works

1. **Arms.** Each run installs one skill set: `none`, `full`, `only:<slug>` or `without:<slug>`. Everything else is identical.
2. **Blinding.**
   - Runs use `_agent/bench-workspace`, where fixtures live under `projects/` and the workspace instructions carry no testing words.
   - Root skill sources and fixture folders named after a skill are removed.
   - `scripts/lib/skill-bench-material.mjs` lists the banned words. Tests check every task prompt against it.
3. **Tasks.** [`agent-suites/skill-bench/tasks.json`](../agent-suites/skill-bench/tasks.json) reuses claim-suite scenarios. Each task names its target skill and 3–6 criteria that only the judge sees.
4. **Runs.** `agent-suites/skill-bench/skill-bench.spec.ts` records the reply, tool calls, diff, commits and hard-check result for each run under `.agent-test/skill-bench/<id>/runs/`. A failed hard check is recorded, not thrown.
5. **Judge.** `scripts/skill-bench-judge.mjs` compares every cross-arm pair in both orders.
   - The judge is Opus, a different model family from the Codex runner, working in an empty sealed workspace.
   - It sees the task, the criteria, and two versions labelled A and B. Skill paths in the action log are masked.
   - It grades from actions and checks, not from claims in the reply.
   - Controls: identical pairs, known-gap pairs (a run against a twin with the work removed) and re-tests.
6. **Verdict.** `scripts/skill-bench-report.mjs` applies the rules in `scripts/lib/pairwise-stats.mjs`, ported from the UI bench:
   - **Better:** win rate ≥ 60%, bootstrap lower bound > 50%, and no more hard-check failures than the baseline.
   - **Not better:** upper bound < 60%.
   - **Inconclusive:** anything else.

   The report also shows median tokens and wall-clock time per arm, with the ratio. Cost is never shown to the judge, so it cannot bias the quality call; read the two side by side.

   No verdict is given before 4 runs per arm per task; fewer runs report **signal only**. An unhealthy judge withholds every verdict.

## Commands

| Step                                                           | Command                                                                       |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Check the pipeline on one task (2 runs)                        | `npm run bench:skill:preflight`                                               |
| Quick signal: every task, 2 repeats, matched pairs, no verdict | `npm run bench:skill:quick`                                                   |
| Run arms on tasks, 4 repeats                                   | `npm run bench:skill -- --arms none,full --tasks leaderboard-speed --id <id>` |
| Judge every unjudged pair and control                          | `npm run bench:skill:judge -- <id>`                                           |
| Report verdicts against a baseline arm                         | `npm run bench:skill:report -- <id> none`                                     |

## Rules

- Calibrate first. Run the `session-expiry-fix` task, whose skill has a known effect, before trusting a verdict on a new skill. If that comes back inconclusive, the bench is not sensitive enough yet.
- A skill or playbook whose verdict is **not better** is retired or reworked. One run is not a verdict.
- `SCORE_GAP` was calibrated on screenshots. Re-check it against human grades of code runs before relying on close calls.
