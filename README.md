# toolbox

<!-- source-of-truth: user-level process and orchestrator Cursor/Claude agent skills. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-02 -->

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

# Core dialogue/build set (subset) — space-separated skill names (not commas)
npx skills add csark0812/toolbox --skill council code-review review-walkthrough grill second-opinion probe tdd prototype domain-model handoff refactor-companion refine-agent-work -g --agent cursor claude-code codex -y
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

Process skills are independently complete. Their descriptions route by user intent; their bodies do not invoke peer skills. Shared vocabulary and seam contracts live in [process-skill-composition.md](references/process-skill-composition.md).

### Planning references (fail-loud vs soft-default)

Fail-loud planning stubs live under `references/planning/*.md` and are linked from skills via GitHub raw URLs — do not execute Linear / `docs/prds/` recipes from them. Soft-default recipe trees are **not** shipped inside portable skill trees and are **not** installed by `--skill '*'`.

Canonical recipes live under `references/planning/soft-default/` and are packaged as [`templates/planning-soft-default/`](templates/planning-soft-default/) plus the binder [`templates/soft-default-planning.md`](templates/soft-default-planning.md). Opt in by copying the pack to `.skeleton/customize/planning-soft-default/`, the binder to `.skeleton/customize/soft-default-planning.md`, and listing that basename in `customize.alwaysInclude` — or re-home equivalent recipes in a consumer-local skill. Remapping consumers must omit that binder and map planning paths to project docs instead.

### Migration (from project `--copy`)

Existing committed toolbox process skill dirs keep loading until removed. Delete only vendored copies of registered toolbox skill slugs under project skill dirs; keep product/standards skills; reinstall process skills with `-g`. Soft-default under `.skeleton/customize/` is not a process skill dir. See [docs/tiers.md](docs/tiers.md).

## Skills

| Group        | Slug               | Purpose                                                                                         |
| ------------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| Orchestrator | council            | Multi-agent depth — create task personas, choose an interaction, run members, synthesize        |
| Orchestrator | handoff            | A2A cross-session — channel + pack + goal; pointers not bodies                                  |
| Process      | code-review        | Choose a task-shaped review mode and file only evidence-backed findings                         |
| Process      | review-walkthrough | Explain a bounded change through the smallest useful causal story                               |
| Process      | second-opinion     | Adversarial critique of a written artifact — invent lenses; layer council for multi-agent depth |
| Process      | grill              | Decision-focused dialogue for unclear intent and consequential design choices                   |
| Process      | probe              | Hunch verdict or hard-bug fix under Authority B                                                 |
| Process      | tdd                | Test-first build at agreed public seams                                                         |
| Process      | prototype          | Throwaway artifact for one design question                                                      |
| Process      | domain-model       | Persist glossary + ADRs when decisions are ready                                                |
| Process      | refactor-companion | Preserve a target design through evidence-led, proven refactor slices                           |
| Process      | refine-agent-work  | Walk through agent-created work, check it against your preferences, and refine bounded slices   |

Orchestrators define **agent-to-agent** wiring; process skills describe **what happens**. Layered prompts compose them without peer runtime dependencies. See [docs/tiers.md](docs/tiers.md).

Consumer projects may add product/standards slugs locally. Ambient shared refs are remote (GitHub); skill-local `references/` stay skill-specific. Consumers remap project docs via `.skeleton/customize/` + `customize.alwaysInclude`. See [docs/tiers.md](docs/tiers.md).

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

Live dogfood uses the installed `@cursor/sdk` in isolated worktrees. Copy `.env.example` to `.env`, set `CURSOR_API_KEY`, then run:

```bash
npm run agent:test:live
```

For verbose failures and kept staging traces, use `npm run agent:test:live:debug`. Debug output defaults to `$TMPDIR/agent-spec` (outside the repo). Avoid `--debug-dir ./…` inside the repo unless you want artifacts in the working tree — `@post-print/agent-test` ≥ 0.1.18 excludes harness staging from worktree leak checks, but `$TMPDIR` keeps `git status` clean. See [`agent-suites/README.md`](agent-suites/README.md).

Toolbox owns portable process-contract behavior (`code-review`, `grill`, …). Consumer repos keep product-specific integration suites that mention local app paths, private docs, custom validation commands, or repo-specific overlays.

## Adding a skill

1. `npm ci` (needs `@csark0812/skeleton` for audit/CLI scripts)
2. Create `<slug>/SKILL.md`
3. Update `docs/tiers.md` and `.skeleton/registry.md` / scan include as needed
4. If sharing ambient refs: edit `references/…`, link from the skill with a GitHub raw URL (`https://raw.githubusercontent.com/csark0812/toolbox/main/references/…`)
5. Stage changes (`git add`), then `npm test` (preferred) or `npm run audit:skills && npm run validate:ci`
6. Push → CI green → `npx skills update -g`

**Validation honesty:** path-scoped `npm run validate:changed -- <skill-path>` barely checks skill bodies — skills suite rules are global. Rely on `npm test` / CI for skill edits. Hub docs (`README.md`, `docs/*`) are fine under `validate:changed`.

Skill-local links use relative paths. Shared contracts use `references/` raw URLs. Peer skill trees are not dependency targets; see [docs/tiers.md](docs/tiers.md).
