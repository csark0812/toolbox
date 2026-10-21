# toolbox

<!-- source-of-truth: user-level process and orchestrator Cursor/Claude agent skills. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

Public process SSOT. Engineers install skills globally (`-g`). Product repos keep product workflows and shared standards — they should not vendor these process skill folders.

New skill packages can start from the public [skeleton](https://github.com/csark0812/skeleton) template. Private preference skills live in a separate global install outside this repo.

See [Christopher's profile](https://github.com/csark0812) for the mobile infrastructure, state tooling, and agent-workflow projects around this repository.

Requires **Node ≥ 22**. Contributor cold-start: [AGENTS.md](AGENTS.md). No runtime environment variables are required (see `.env.example`).

## Install

Install destinations (where agents look):

| Agent       | Project-scoped    | Global              |
| ----------- | ----------------- | ------------------- |
| Cursor      | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex       | `.agents/skills/` | `~/.codex/skills/`  |

Toolbox **process** skills install to **Global** only. Project skill dirs are for consumer product/standards skills (and planning overlays), not vendored toolbox process copies.

```bash
# Process / orchestrators — user-level (`*` = registered skill slugs only; not soft-default templates)
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code codex -y
npx skills update -g
```

Shorthand for `https://github.com/csark0812/toolbox`. The `@` prefix (npm-style scopes) is not supported by the skills CLI — use `csark0812/toolbox`.

**Clone dogfood:** project sync of toolbox process skills is allowed **only inside this toolbox clone** while authoring (e.g. local suite work). Do not commit toolbox process skills into other repos.

## In a consumer repo

Skeleton can audit the repo’s docs/skills perimeter. Toolbox process skills still install **globally** on each engineer’s machine — not into the consumer skill tree.

```bash
# Optional: audit scaffolding only (does not install toolbox process skills)
npm install -D @csark0812/skeleton
npx skeleton init --skills

# Process skills — user-level
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code codex -y
npx skills update -g
```

After init, edit `skeleton.toml` for your layout and run `npx skeleton audit self` to verify.

### Roles

| Piece                      | Role                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| **toolbox** (this repo)    | Process skill SSOT — installed user-level (`-g`), not vendored into consumer repos                    |
| **skeleton**               | Docs/skill registry linter — validates links, banners, and scan perimeter                             |
| **`.skeleton/customize/`** | Consumer-local overlays (product docs, alwaysInclude, soft-default binders) — **consumer repos only** |
| **`references/`**          | Canonical ambient reference docs — skills link via GitHub raw URLs (not copied into each skill)       |

Do not edit installed `SKILL.md` copies in place. Process SSOT updates via global install / this repo. Consumer customize overlays carry product-local context. See [skeleton customize docs](https://github.com/csark0812/skeleton/blob/main/docs/developer/customize.md).

Ambient shared refs live once under [`references/`](references/). Skill bodies open them via `raw.githubusercontent.com/csark0812/toolbox/main/...` (network required). Validation: [docs/github-ambient-refs-validation.md](docs/github-ambient-refs-validation.md). Skill-local refs (unique to one skill) stay under `{slug}/references/`.

Process skills are independently complete. Their descriptions route by user intent; declared orchestrators invoke discovered companions. Shared vocabulary and seam contracts live in [process-skill-composition.md](references/v2/process-skill-composition.md).

### Planning references (fail-loud vs soft-default)

Fail-loud planning stubs live under `references/planning/*.md` and are linked from skills via GitHub raw URLs — do not execute Linear / `docs/prds/` recipes from them. Soft-default recipe trees are **not** shipped inside portable skill trees and are **not** installed by `--skill '*'`.

Canonical recipes live under `references/planning/soft-default/` and are packaged as [`templates/planning-soft-default/`](templates/planning-soft-default/) plus the binder [`templates/soft-default-planning.md`](templates/soft-default-planning.md). Opt in by copying the pack to `.skeleton/customize/planning-soft-default/`, the binder to `.skeleton/customize/soft-default-planning.md`, and listing that basename in `customize.alwaysInclude` — or re-home equivalent recipes in a consumer-local skill. Remapping consumers must omit that binder and map planning paths to project docs instead.

### Migration (from project `--copy`)

Existing committed toolbox process skill dirs keep loading until removed. Delete only vendored copies of registered toolbox skill slugs under project skill dirs; keep product/standards skills; reinstall process skills with `-g`. Soft-default under `.skeleton/customize/` is not a process skill dir. See [docs/tiers.md](docs/tiers.md).

See the [design and CSS source index](references/design-source-index.md) for the source material behind the new design skills. The [replacement matrix](references/design-replacement-matrix.md) maps old capabilities to their new owners. The [rendered browser verifier](scripts/check-rendered-interface.mjs) checks a served page for overflow, page errors, and primary-action visibility, contrast, and keyboard focus.

## Skills

| Group        | Slug                     | Purpose                                                                                         |
| ------------ | ------------------------ | ----------------------------------------------------------------------------------------------- |
| Orchestrator | council                  | Multi-agent depth — create task personas, choose an interaction, run members, synthesize        |
| Orchestrator | handoff                  | A2A cross-session — channel + pack + goal; pointers not bodies                                  |
| Orchestrator | workflow                 | Route engineering work, run step playbooks, and coordinate ownership sessions                   |
| Orchestrator | orchestrate              | Explicit durable multi-unit programs with ownership and recovery                                |
| Process      | code-review              | Choose a task-shaped review mode and file only evidence-backed findings                         |
| Process      | review-walkthrough       | Explain a bounded change through the smallest useful causal story                               |
| Process      | second-opinion           | Adversarial critique of a written artifact — invent lenses; layer council for multi-agent depth |
| Process      | grill                    | Decision-focused dialogue for unclear intent and consequential design choices                   |
| Process      | css-craft                | Focused CSS diagnosis, technique choice, and browser-aware proof                                |
| Process      | taste                    | Build or polish a page or screen so it looks designed for its subject; screenshot and fix       |
| Process      | evidence-based-debugging | Reproduce and diagnose failures; demonstrate and verify authorized repairs                      |
| Process      | probe                    | Cited verdict on a specific hunch or claim                                                      |
| Process      | tdd                      | Test-first build at agreed public seams                                                         |
| Process      | prototype                | Throwaway artifact for one design question                                                      |
| Process      | domain-model             | Persist glossary + ADRs when decisions are ready                                                |
| Process      | refactor-companion       | Preserve a target design through evidence-led, proven refactor slices                           |
| Process      | branch-status            | Map unique-ahead branches, stacks, and stale work                                               |
| Process      | i-need-help              | Stop when repeated work makes no progress; ask the current owner for specific help              |
| Process      | create-bounded-commits   | Coordinate ownership, group changes, validate, and create bounded local commits                 |
| Process      | retro                    | Explicit session retrospective with prioritized recommendations for the agent's environment     |
| Process      | babysit-pr               | Drive one open PR to merge-ready: fix CI, resolve conflicts, address threads; never merge       |
| Process      | hillclimb                | Move one measured number to a target through a frozen harness and logged keep-or-revert commits |
| Process      | verification             | Create or maintain an executable repo verification recipe                                       |
| Process      | technical-writing        | Write or revise technical documents around the reader task                                      |
| Process      | strict-english           | Explicit constrained plain-English rewrite                                                      |

Orchestrators define **agent-to-agent** wiring; process skills describe **what happens**. Layered prompts compose them without peer runtime dependencies. See [docs/tiers.md](docs/tiers.md).

Consumer projects may add product/standards slugs locally. Ambient shared refs are remote (GitHub); skill-local `references/` stay skill-specific. Consumers remap project docs via `.skeleton/customize/` + `customize.alwaysInclude`. See [docs/tiers.md](docs/tiers.md).

## How toolbox compares with pstack

[pstack](https://github.com/backnotprop/pstack) is the closest comparable skill pack. On every held-out set so far, toolbox beats it overall at lower token cost, but it has not yet met the bar this repo sets for calling it undeniably better. Results come from the [skill bench](docs/skill-bench.md).

**The required bar.** Before toolbox counts as better than pstack at all, a frozen held-out set must give a pooled verdict of **better**, with every skill **better** or **saturated** and a healthy judge. Inconclusive is not enough. Saturated is the one exception: nearly every comparison is a tie because both packs reached the same verified result, so neither could do better. See [docs/skill-bench.md](docs/skill-bench.md#required-bar-set-after-held-out-v8).

**The strong bar.** On a frozen held-out set, toolbox as installed (no skill named in the prompt) must clear all four conditions against pstack at full strength:

- win at least 90% of decided comparisons pooled across tasks, with the 95% lower bound at least 60%;
- be better on every skill;
- use at least 20% fewer tokens;
- pass every judge health check.

The bar is fixed in [docs/skill-bench.md](docs/skill-bench.md#strong-claim-fixed-before-held-out-v3). It may be tightened but is never loosened after seeing results. It was set for both Claude and Codex. While the Codex subscription is exhausted, the user narrowed it to Claude, judged by Opus.

**How it is measured**

- **Fresh frozen sets.** Each held-out set is written by an agent that has seen no results and no skill files, and is locked (`holdout-v*.lock.json`) before any run. A set is never tuned against. Fixes are developed on separate development tasks, and each round is judged on a new set.
- **pstack at full strength:** a pinned commit, its per-runner model settings, its subagents on Claude, and its entry skill started as `/poteto-mode` (Claude) or named in the prompt (Codex).
- **Judging:** 4 runs per arm per task. A judge compares every pair in both orders, blind to which pack is which, with identical-pair, known-gap and re-test controls. The judge is from the other model family by default; Claude results from v4 on are judged by Opus, the same family, and are labelled that way.

**Results**

| Set (tasks) | Runner | Toolbox pooled win rate | Skills better | Tokens vs pstack |
| ----------- | ------ | ----------------------- | ------------- | ---------------- |
| v1 (8)      | Claude | 50%                     | 0 of 8        | 0.5×             |
| v1 (8)      | Codex  | 83%                     | 5 of 8        | 0.5×             |
| v2 (10)     | Claude | 67% (56–80%)            | 2 of 9        | 0.8×             |
| v2 (10)     | Codex  | 69% (44–89%)            | 1 of 8        | 0.4×             |
| v3 (18)     | Claude | 78% (61–91%)            | 2 of 9        | 0.9×             |
| v3 (18)     | Codex  | 62% (41–81%)            | 1 of 9        | 0.7×             |
| v4 (27)     | Codex  | 64% (46–81%)            | 2 of 9        | 0.5×             |
| v5 (27)     | Claude | 73% (59–85%)            | 2 of 9        | 0.8×             |
| v6 (27)     | Claude | **81% (69–91%)**        | 4 of 9        | 0.7×             |
| v7 (18)     | Claude | 75% (58–89%)            | 2 of 9        | 0.6×             |

- **Where toolbox leads.** On v3 Claude it was clearly better on hillclimb (24/1/7), code review (14/0/18) and CSS (26/1/1). On v4 Codex it led on hillclimb (28/3/17) and CSS (37/0/11).
- **Losses.**
  - **v4 Codex code review: 0/36/12.** The reviews stopped after the first blockers and missed findings, such as a guessable `Math.random()` token.
  - **v3 Codex babysit-pr: close to even.** On Codex, PR tasks were also harder than they should be: before the run-local `TMPDIR` fix, the offline mirror's CI could not pass for either pack.
- **Latest (v6, Claude, Opus judge, answers unseen by the tuning side).** Better on workflow (36/1/11), hillclimb (41/4/3), probe (38/7/3) and CSS (29/5/14). The other five skills lean toolbox but are inconclusive: debugging 32/9, tdd 28/5, code review 25/9, babysit-pr 23/12 and refactor 22/12. The bar is still not met: 81% pooled against 90% required, and not every skill is better. v7 (18 tasks, after round-6 fixes) came in at 75% pooled, with 2 of 9 skills better (hillclimb 28/0/4, CSS 14/0/18), at 0.6× tokens. That is within the noise of v6 and not an improvement: Claude results have plateaued at 73–81% since v3. v5 and v6 are Claude-only, judged by Opus (same family). The Codex runs wait for the Codex subscription limit to reset.
- **What changed between rounds.** Fixes came from judge reasons and were developed against development tasks only:
  - **Auto-invocation on Claude:** valid YAML frontmatter, and short trigger-first descriptions with example requests. Invocation went from 9 of 32 to 14 of 14 on development tasks.
  - **A reply check inside every skill:** a result must name a command that was run after the last edit.
  - **Before-and-after baselines** for refactors and perf work.
  - **Completeness sweeps** in code review.
  - **Hostile-input and platform-limit tests** in tdd.
  - **Lean execution.**
- **Bench defects found and fixed along the way:**
  - npm broke in sandboxes because of a Node symlink flag;
  - the workspace guard flagged heredocs, escaped quotes and unrecorded Codex working folders;
  - Codex shells had no writable temp folder;
  - pstack's explicit-only entry skill was sometimes refused when the prompt only named it.

**How the two differ.** pstack routes every task through one mode skill that loads principle skills. Toolbox keeps independent specialists that route by description. Only `workflow` and `orchestrate` compose them, and `workflow` copies a step playbook into the task list. Toolbox also ships automated gates that pstack does not have: skill audits, agent conformance suites, and this bench. The bench retires any skill that does not beat its baseline.

**Caveats**

- v1 and v2 have one task per skill; v3 has two and v4 and v5 three. A per-skill verdict needs every task's 4 runs per arm.
- Runs that read outside their workspace are excluded and re-run. A cell with fewer than 4 clean runs reports signal only.
- The agent that tunes toolbox sees each set's prompts and true answers when the set is handed over. For that reason, skills are committed before each set is frozen and stay unchanged until that set's results are in. Trigger examples are checked so that none echo a held-out prompt.

## Daily workflow

```bash
cd /path/to/toolbox   # your local clone
git pull
npx skills update -g
```

## Contributor bootstrap

```bash
# Node ≥ 22 (see package.json engines)
npm ci
npm run check

# Optional local hooks (install the tool once per machine, then per clone)
# brew install pre-commit   # or: pipx install pre-commit
pre-commit install          # runs npm test on commit
```

`npm run check` / `npm start` runs format, lint, typecheck, vitest unit fixtures, hub + skills audits, `validate:ci`, and the production dependency audit (matches CI). `npm test` is the skill gate subset (unit + audits + validate:ci). `npm ci` pulls `@csark0812/skeleton` from the registry; for local dogfood only: `npm install ../skeleton` (do not commit the link).

### Agent suites

Portable agent conformance lives under [`agent-suites/`](agent-suites/). Suites prove **portable process contracts**, not consumer product workflows. Suite validation is credential-free:

```bash
npm run agent:test
```

Live dogfood uses the configured Codex subscription in isolated workspaces. Run:

```bash
npm run agent:test:live
```

Use `node node_modules/@post-print/agent-test/dist/cli.js viewer --config agent-test.config.ts --port 4179` for the visual run viewer. Local traces are saved under `.agent-test/executions/`. See [`agent-suites/README.md`](agent-suites/README.md).

Toolbox owns portable process-contract behavior (`code-review`, `grill`, …). Consumer repos keep product-specific integration suites that mention local app paths, private docs, custom validation commands, or repo-specific overlays.

## Adding a skill

1. `npm ci` (needs `@csark0812/skeleton` for audit/CLI scripts)
2. Create `<slug>/SKILL.md` with `name`, a routing `description` ending in a `Not …` clause, and the `source-of-truth` + `doc-meta` comments
3. Register the slug everywhere the tests check:
   - `src/expected-skills.ts` (`kind`, `invocation`, `required`, `optional`)
   - `.skeleton/registry.md`
   - `skills-lock.json` (`computedHash` = SHA-256 of `SKILL.md`)
   - `skeleton.toml` `ownedSlugs` and `[scan].include`
   - `docs/tiers.md` and the Skills table above
   - explicit-only skills: `disable-model-invocation: true` plus `agents/openai.yaml`
4. Add an agent suite: `agent-suites/<slug>/claims.json`, `agent-suites/v2/<slug>.spec.ts`, and `migration-index.json` rows
5. If sharing ambient refs: edit `references/…`, link from the skill with a GitHub raw URL (`https://raw.githubusercontent.com/csark0812/toolbox/main/references/…`)
6. Stage changes (`git add`), then `npm test` (preferred) or `npm run audit:skills && npm run validate:ci`
7. Push → CI green → `npx skills update -g`

**Validation honesty:** path-scoped `npm run validate:changed -- <skill-path>` barely checks skill bodies — skills suite rules are global. Rely on `npm test` / CI for skill edits. Hub docs (`README.md`, `docs/*`) are fine under `validate:changed`.

Skill-local links use relative paths. Shared contracts use `references/` raw URLs. Peer skill trees are not dependency targets; see [docs/tiers.md](docs/tiers.md).
