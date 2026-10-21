# Skill bench

<!-- source-of-truth: blinded pairwise benchmark that decides whether a skill beats its baseline -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

A skill ships or stays only if it beats its baseline in this bench. Conformance suites prove that a skill is followed. The bench asks whether following it produces better work.

## How it works

1. **Arms and runners.** Each run installs one skill set: `none`, `full`, `only:<slug>`, `without:<slug>`, or `pack:<name>[@<entry>]` for a comparison pack such as pstack. Everything else is identical. `--runner codex|claude` picks the agent host for every arm.
   - A pack arm gets the setup its own docs call for. `node scripts/fetch-pack.mjs pstack` fetches pstack at a pinned commit, places its per-runner model settings file and (on Claude) its subagents in the workspace, and the entry skill starts the way pstack documents: as the slash command `/poteto-mode` on Claude, and named in the prompt on Codex.
2. **Blinding.**
   - Runs use `_agent/bench-workspace-<runner>`, where fixtures live under `projects/` and the workspace instructions carry no testing words.
   - Root skill sources and fixture folders named after a skill are removed.
   - `scripts/lib/skill-bench-material.mjs` lists the banned words. Tests check every task prompt against it.
3. **Tasks.** Each task names its target skill and 3–6 criteria that only the judge sees.
   - [`tasks.json`](../agent-suites/skill-bench/tasks.json) is the development set. It reuses claim-suite scenarios and may be used to tune skills.
   - Tasks whose id ends in `-plain` carry `"variant": true`. Each rewords another development task's prompt and reuses its fixture, criteria and check, so it tests only whether the skill still triggers under different wording. Do not pool a variant with its original when judging a fix: report them separately, or the shared scenario is counted twice.
   - `holdout.json`, `holdout-v2.json` through `holdout-v8.json`, and `holdout-design-v1.json` (visual design only) in [`agent-suites/skill-bench/`](../agent-suites/skill-bench/) are held-out sets (`--taskset holdout-v8` and so on). Each has its own `<set>-checks/` folder and `<set>.lock.json`; freeze a new set with `node scripts/freeze-holdout.mjs --set <set> --write` before its first run.
   - Each held-out set is written and frozen before any run and is never tuned against. Each task has a hidden acceptance check that never enters the agent's workspace. The lock pins a SHA-256 over every file the set uses, and a test fails on drift. Development tasks may have hidden checks too, under `dev-checks/`. Re-freezing after seeing results voids the held-out claim.
4. **Runs.** `agent-suites/skill-bench/skill-bench.spec.ts` records the reply, tool calls, diff, commits and hard-check result for each run under `.agent-test/skill-bench/<id>/runs/`. A failed hard check is recorded, not thrown.
5. **Judge.** `scripts/skill-bench-judge.mjs` compares every cross-arm pair in both orders.
   - The judge is from the other model family than the runs it grades (Opus for Codex runs, Codex for Claude runs), working in an empty temporary folder. `SKILL_BENCH_JUDGE=claude|codex` overrides this when a family is unavailable, and the report names the judge model.
   - It sees the task, the criteria, and two versions labelled A and B. Skill and pack names and skill paths are masked everywhere it reads.
   - It grades from actions and checks, not from claims in the reply.
   - A visual task (one with `render`) adds pictures taken the same way for every arm by `scripts/lib/bench-render.mjs`: every screen at 390 and 1440px, plus motion and interaction frames at 1440px. The frames show the first screen 0, 300 and 1200ms after load (CSS animations and the page's script clock are both paused between frames, so the times hold for either kind of motion), the first button or button-styled link at rest, on hover and on keyboard focus, the next two sections as they scroll in and once settled (from a fresh load, found by position however the page is wrapped), and the first screen with reduced motion. The judge sees them in labelled groups under neutral names. When only one version of a pair has screenshots, or frames, that section is left out for both and the judge is told so. `run` stops before any agent starts when the selected tasks include a visual task and no Chromium or Chrome is installed.
   - Controls: identical pairs, known-gap pairs (a run against a twin with the work removed) and re-tests.
6. **Verdict.** `scripts/skill-bench-report.mjs` applies the rules in `scripts/lib/pairwise-stats.mjs`, ported from the UI bench:
   - **Better:** win rate ≥ 60%, bootstrap lower bound > 50%, and no more hard-check failures than the baseline.
   - **Not better:** upper bound < 60%.
   - **Saturated:** none of the above, but at least 75% of pairs are ties, wins are at least losses, there are no more hard-check failures than the baseline, and median tokens are at least 10% lower (a focus-to-baseline ratio of 0.9 or less). Both arms reached the same verified result so often that nothing could be better, so the clearly cheaper arm is the better one.
   - **Inconclusive:** anything else.

   The report also shows median tokens and wall-clock time per arm, with the ratio. Cost is never shown to the judge, so it cannot bias the quality call; read the two side by side.

   No verdict is given before 4 runs per arm per task; fewer runs report **signal only**. An unhealthy judge withholds every verdict.

## Required bar (set after held-out v8)

Every held-out set must clear this before toolbox counts as better than a comparison pack. The report prints it as **Required bar**.

1. **The pooled verdict is better.**
2. **Every skill is better or saturated.** Inconclusive is not enough. Saturated is the one exception: it marks a skill whose tasks left no room to do better, which also says the set should give that skill harder tasks next time. Every skill the set targets gets a row: one with no judged pairs (its runs lost or never judged) reports **missing**, which fails the bar.
3. **Healthy judge.**

## Strong claim (fixed before held-out v3)

"Toolbox is undeniably better than a comparison pack" is claimed only when one frozen held-out set meets every condition below, on **each** runner (Claude and Codex). The arms are toolbox as installed (`full`, no skill named in the prompt) and the pack at full strength (`pack:pstack@poteto-mode`). The report prints the check as **Strong claim**.

1. **Pooled win rate ≥ 90%, lower bound ≥ 60%.** Pool every decided pair across the set's tasks. Toolbox wins at least 90% of them, and the bootstrap lower bound (resampling tasks, then runs) is at least 60%.
2. **Every skill better.** Each skill has two or three tasks, so its verdict rests on 8–12 runs per arm.
3. **At least 20% fewer tokens.** The median token ratio across skills is 0.8 or less.
4. **Healthy judge.**

**Scope while Codex is unavailable.** From held-out v4 on, the user narrowed the claim to the Claude runner and accepted an Opus judge (`SKILL_BENCH_JUDGE=claude`), because the Codex subscription was exhausted. The judge is still blind to which pack is which and must pass every control, but it is the same family as the runs, so these results are labelled same-family. A cross-family re-judge follows when Codex is available.

These conditions were written before any held-out v3 run. During that run the user tightened them twice, to the conditions above (from: pooled lower bound ≥ 60%, no skill not better, two thirds of skills better, token ratio ≤ 1); they may be tightened but are never loosened after seeing results. If a set misses the bar, the next attempt fixes skills against development tasks and uses a new frozen set.

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
