# Agent entry (toolbox)

<!-- source-of-truth: agent cold-start in this repo. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-02 -->

Public process skills SSOT (user-level install). Markdown skills + skeleton audits — not a TypeScript app. No runtime env vars required (see `.env.example`).

## First hour

Requires **Node ≥ 22**.

```bash
npm ci
npm run check
```

`npm run check` = format + lint + typecheck + unit fixtures + hub/skills audits + `validate:ci` + production dependency audit (same gates as CI). Shorthand: `npm start`.

Optional git hooks — install [pre-commit](https://pre-commit.com/) once per machine (`brew install pre-commit` or `pipx install pre-commit`), then:

```bash
pre-commit install
```

`npm ci` installs `@csark0812/skeleton` from the npm registry (see `package-lock.json`). For local skeleton dogfood only: `npm install ../skeleton` — do not commit that link.

## Layout

- Flat skills: `<slug>/SKILL.md` (for example `council/SKILL.md`)
- Shared module: `src/expected-skills.ts` (canonical slug list — `npm run typecheck`)
- Tests: `tests/`
- Agent conformance suites: `agent-suites/` (`npm run agent:test`)
- Canonical ambient refs: `.skeleton/references/` — skills link via GitHub raw URLs (see [docs/github-ambient-refs-validation.md](docs/github-ambient-refs-validation.md)). No per-skill materialization.
- Hub taxonomy: `docs/tiers.md`, `.skeleton/registry.md`
- This clone ships process skills + skeleton config. Private preference skills live in a separate global install outside this repo. See [tiers](docs/tiers.md).

## Validation

| Change                            | Run                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Hub docs (`README.md`, `docs/**`) | `npm run validate:changed -- <path>`                                                  |
| Ambient shared refs               | Edit `.skeleton/references/`. Skill bodies already point at raw GitHub URLs on `main` |
| Skill bodies / unsure             | `npm run check` (or `npm test` / `audit:skills` + `validate:ci`)                      |
| Agent suite scenarios             | `npm run agent:test` (replay)                                                         |
| Style (md/yaml)                   | `npm run lint` + `npm run format:check`                                               |
| Shared `src/` TypeScript          | `npm run typecheck`                                                                   |

Path-scoped `validate:changed` on skill-only paths exits non-zero and redirects to `audit skills` / `audit self`. Skill-body rules are global. Path-scoped coverage is empty. Use `npm test` or `npm run check` for skill edits. Pre-commit runs `npm test` so local hooks match the skill gate.

`npm test` = unit fixtures + `audit:hub` + `audit:skills` + `validate:ci`. `npm run check` / `npm start` also runs format, lint, typecheck, and `npm audit --omit=dev` (CI + First hour). Optional deeper pass: `npm run audit:self` (docs + skills — SSOT-bearing files need `<!-- source-of-truth: … -->` + doc-meta). Skill-path redirect needs `@csark0812/skeleton` ≥ 2.0.0.

`npm run agent:test` runs replay-based portable conformance suites for public toolbox skills. `npm run agent:test:live` uses Cursor SDK dogfood in isolated worktrees and requires `CURSOR_API_KEY`. `npm run agent:test:live:debug` adds verbose failures and keeps staging under `$TMPDIR/agent-spec` by default (see `agent-suites/README.md`). Keep consumer and product-specific suites (for example PostPrint app paths, private docs, and repo validation commands) in the consumer repo.

## Install destinations

| Agent       | Project           | Global              |
| ----------- | ----------------- | ------------------- |
| Cursor      | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex       | `.agents/skills/` | `~/.codex/skills/`  |

Toolbox process skills install to **Global** (`-g`) only. Project dirs are for consumer product/standards skills. Use space-separated `--skill` names (or `--skill '*'`), not commas. Include `codex` in `--agent` when installing for Codex.

See [README](README.md) · [tiers](docs/tiers.md) · `package.json` scripts.
