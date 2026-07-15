# toolbox

**Source of truth for** team Cursor/Claude agent skills.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

Public SSOT for reusable Cursor/Claude agent skills.

New skill packages can start from the public [skeleton](https://github.com/csark0812/skeleton) template. Personal or org-private skills stay outside this repo.

Requires **Node ≥ 22**. Contributor cold-start: [AGENTS.md](AGENTS.md). No runtime environment variables are required (see `.env.example`).

## Install

Install destinations (skills CLI):

| Agent       | Project-scoped    | Global              |
| ----------- | ----------------- | ------------------- |
| Cursor      | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex       | `.agents/skills/` | `~/.codex/skills/`  |

```bash
# All team skills (7 slugs), global — Cursor, Claude Code, and Codex
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code codex -y

# All team skills, project-scoped (commit under .agents/skills/ and/or .claude/skills/)
# Codex shares `.agents/skills/` with Cursor project installs.
npx skills add csark0812/toolbox --skill '*' --agent cursor claude-code codex --copy -y

# Core dialogue/review set (subset) — space-separated skill names (not commas)
npx skills add csark0812/toolbox --skill multi code-review crystallize grill second-opinion investigate handoff --agent cursor claude-code codex --copy -y

# Update after push
npx skills update -g   # global
npx skills update -p   # project
```

Shorthand for `https://github.com/csark0812/toolbox`. The `@` prefix (npm-style scopes) is not supported by the skills CLI — use `csark0812/toolbox`.

Symlink installs keep a canonical copy under `.agents/skills/` with agent-specific links elsewhere. Prefer `--copy` when committing skills into a consumer repo.

## In a consumer repo

Two steps: skeleton validates the repo's docs/skills perimeter; toolbox supplies the skills.

```bash
# 1. SSOT audit harness (once per project)
npm install -D @csark0812/skeleton
npx skeleton init --skills

# 2. Team skills (global or project-scoped)
npx skills add csark0812/toolbox --skill multi code-review crystallize grill second-opinion investigate handoff -a cursor claude-code codex --copy -y
```

After init, edit `.skeleton/config.yaml` for your layout and run `npx skeleton audit self` to verify.

### Roles

| Piece                       | Role                                                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **toolbox** (this repo)     | Skill source SSOT — what skills exist and how they're written                                                         |
| **skeleton**                | Docs/skill registry linter — validates links, banners, and scan perimeter                                             |
| **`.skeleton/customize/`**  | Project-specific skill overrides (injected via IDE hooks on read) — **consumer repos only**, not present in this tree |
| **`.skeleton/references/`** | Canonical shared reference docs — copied into each skill at build time                                                |

Do not edit synced `SKILL.md` files in consumer projects — override in `.skeleton/customize/<slug>.md` instead. See [skeleton customize docs](https://github.com/csark0812/skeleton/blob/main/docs/developer/customize.md).

Each skill is self-contained: shared reference docs are generated copies under `{slug}/references/` with provenance headers. Edit canonical files in `.skeleton/references/`, then run `npm run references:sync`.

### Planning references (fail-loud vs soft-default)

Synced skill-tree `references/planning/*.md` files are **fail-loud stubs** — do not execute Linear / `docs/prds/` recipes from them. Soft-default recipe trees are **not** shipped inside portable skill trees.

Canonical recipes live under `.skeleton/references/planning/soft-default/` and are packaged for bare consumers as [`templates/planning-soft-default/`](templates/planning-soft-default/) plus the binder [`templates/soft-default-planning.md`](templates/soft-default-planning.md). Opt in by copying the pack to `.skeleton/customize/planning-soft-default/`, the binder to `.skeleton/customize/soft-default-planning.md`, and listing that basename in `customize.alwaysInclude`. Remapping consumers must omit that binder and map planning paths to project docs instead.

## Skills

| Slug           | Purpose                                      |
| -------------- | -------------------------------------------- |
| multi          | Parallel subagent orchestration kernel       |
| code-review    | Multi-lens code review with council dispatch |
| crystallize    | Fuzzy idea → shaped intent                   |
| grill          | Pressure-test design before implementation   |
| second-opinion | Written plan review                          |
| investigate    | Confirm/refute a code or approach hunch      |
| handoff        | Compact session handoff                      |

Consumer projects may lock additional slugs (`debug`, `testing`, `product-principles`, …) — **every lock key is replaced on resync**. Portable `references/` copies are stubs; consumers map to project docs via `.skeleton/customize/` + `customize.alwaysInclude`. See [docs/tiers.md](docs/tiers.md).

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

`npm run check` / `npm start` runs format, lint, typecheck, vitest unit fixtures, `references:check`, hub + skills audits, and `validate:ci` (matches CI). `npm test` is the skill gate subset (unit + audits + validate:ci). `npm ci` pulls `@csark0812/skeleton` from the registry; for local dogfood only: `npm install ../skeleton` (do not commit the link).

### Agent suites

Portable agent conformance lives under [`agent-suites/`](agent-suites/). Replay mode is credential-free:

```bash
# Requires Bun while @post-print/agent-test's published ESM uses extensionless imports.
npm run agent:test
```

Live dogfood uses the installed `@cursor/sdk` in isolated worktrees. Copy `.env.example` to `.env`, set `CURSOR_API_KEY`, then run:

```bash
npm run agent:test:live
```

Toolbox owns generic skill-contract behavior (`code-review`, routing, `grill`, `crystallize`). Consumer repos keep product-specific integration suites that mention local app paths, private docs, custom validation commands, or repo-specific overlays.

## Adding a skill

1. `npm ci` (needs `@csark0812/skeleton` for audit/CLI scripts)
2. Create `<slug>/SKILL.md`
3. Update `docs/tiers.md` and `.skeleton/registry.md` / scan include as needed
4. If sharing refs: edit `.skeleton/references/…`, link with `../references/...` in skill source, then `npm run references:sync` and `npm run references:check`
5. Stage changes (`git add`), then `npm test` (preferred) or `npm run audit:skills && npm run validate:ci`
6. Push → CI green → `npx skills update -g`

**Validation honesty:** path-scoped `npm run validate:changed -- <skill-path>` barely checks skill bodies — skills suite rules are global. Rely on `npm test` / CI for skill edits. Hub docs (`README.md`, `docs/*`) are fine under `validate:changed`.

Inter-toolbox links use relative paths (`../multi/SKILL.md`). Project-local skills must not use `/SKILL.md` links from toolbox — see [docs/tiers.md](docs/tiers.md).
