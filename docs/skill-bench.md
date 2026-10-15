# Skill bench

<!-- source-of-truth: blinded pairwise benchmark that decides whether a skill beats its baseline -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

A skill ships or stays only if it beats its baseline in this bench. Conformance suites prove that a skill is followed. The bench asks whether following it produces better work.

## How it works

1. **Arms and runners.** Each run installs one skill set: `none`, `full`, `only:<slug>`, `without:<slug>`, or `pack:<name>[@<entry>]` for a comparison pack such as pstack. Everything else is identical. `--runner codex|claude` picks the agent host for every arm.
   - A pack arm gets the setup its own docs call for. `node scripts/fetch-pack.mjs pstack` fetches pstack at a pinned commit, places its per-runner model settings file and (on Claude) its subagents in the workspace, and the entry prompt names the entry skill (`/poteto-mode`) the way pstack documents.
2. **Blinding.**
   - Runs use `_agent/bench-workspace-<runner>`, where fixtures live under `projects/` and the workspace instructions carry no testing words.
   - Root skill sources and fixture folders named after a skill are removed.
   - `scripts/lib/skill-bench-material.mjs` lists the banned words. Tests check every task prompt against it.
3. **Tasks.** Each task names its target skill and 3–6 criteria that only the judge sees.
   - [`tasks.json`](../agent-suites/skill-bench/tasks.json) is the development set. It reuses claim-suite scenarios and may be used to tune skills.
   - [`holdout.json`](../agent-suites/skill-bench/holdout.json) is the held-out set (`--taskset holdout`). It was written and frozen before further tuning and is never tuned against. Each task has a hidden acceptance check under `holdout-checks/` that never enters the agent's workspace. `holdout.lock.json` pins a SHA-256 over every held-out file, and a test fails on drift. Re-freezing after seeing results voids the held-out claim.
4. **Runs.** `agent-suites/skill-bench/skill-bench.spec.ts` records the reply, tool calls, diff, commits and hard-check result for each run under `.agent-test/skill-bench/<id>/runs/`. A failed hard check is recorded, not thrown.
5. **Judge.** `scripts/skill-bench-judge.mjs` compares every cross-arm pair in both orders.
   - The judge is from the other model family than the runs it grades (Opus for Codex runs, Codex for Claude runs), working in an empty temporary folder.
   - It sees the task, the criteria, and two versions labelled A and B. Skill and pack names and skill paths are masked everywhere it reads.
   - It grades from actions and checks, not from claims in the reply.
   - Controls: identical pairs, known-gap pairs (a run against a twin with the work removed) and re-tests.
6. **Verdict.** `scripts/skill-bench-report.mjs` applies the rules in `scripts/lib/pairwise-stats.mjs`, ported from the UI bench:
   - **Better:** win rate ≥ 60%, bootstrap lower bound > 50%, and no more hard-check failures than the baseline.
   - **Not better:** upper bound < 60%.
   - **Inconclusive:** anything else.

   The report also shows median tokens and wall-clock time per arm, with the ratio. Cost is never shown to the judge, so it cannot bias the quality call; read the two side by side.

   No verdict is given before 4 runs per arm per task; fewer runs report **signal only**. An unhealthy judge withholds every verdict.

## Commands

| Step                                                           | Command                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Check the pipeline on one task (2 runs)                        | `npm run bench:skill:preflight`                                                                          |
| Quick signal: every task, 2 repeats, matched pairs, no verdict | `npm run bench:skill:quick`                                                                              |
| Run arms on tasks, 4 repeats                                   | `npm run bench:skill -- --arms none,full --tasks leaderboard-speed --id <id>`                            |
| Judge every unjudged pair and control                          | `npm run bench:skill:judge -- <id>`                                                                      |
| Report verdicts against a baseline arm                         | `npm run bench:skill:report -- <id> none`                                                                |
| Held-out comparison against pstack, one runner                 | `npm run bench:skill -- --taskset holdout --arms full,pack:pstack@poteto-mode --runner claude --id <id>` |
| Calibrate the win threshold on development runs                | `node scripts/skill-bench-calibrate.mjs <dev-bench-id>...`                                               |

Every command takes `--workers <n>` (agent runs at once, default 4) and `--judges <n>` (judge calls at once, default 6). Subscription rate limits are the practical ceiling; lower them if runs start failing as infrastructure errors.

## Rules

- Calibrate first. Run the `session-expiry-fix` task, whose skill has a known effect, before trusting a verdict on a new skill. If that comes back inconclusive, the bench is not sensitive enough yet.
- A skill or playbook whose verdict is **not better** is retired or reworked. One run is not a verdict.
- `SCORE_GAP` (the minimum score gap that counts as a win) is calibrated for code with graded twins: each development run is judged against a copy with its shown evidence removed and against itself. `skill-bench-calibrate.mjs` picks the smallest gap that calls identical runs a win at most 10% of the time. Never calibrate on held-out runs. The 2026-10-15 calibration (44 development runs) found 100% of evidence-stripped twins lose and 0% of identical pairs are called at every gap from 0.25 to 1, so 0.25 stands; the twins were too far apart to separate thresholds, so finer tuning needs human grades ([calibration-2026-10-15.json](../agent-suites/skill-bench/calibration-2026-10-15.json)).
