# Agent entry (toolbox)

**Source of truth for** agent cold-start in this repo.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

Public team skills SSOT. Markdown skills + skeleton audits — not a TypeScript app. No runtime env vars required (see `.env.example`).

## First hour

Requires **Node ≥ 22**.

```bash
npm ci
npm run check
```

`npm run check` = format + lint + typecheck + unit fixtures + references check + hub/skills audits + `validate:ci` (same gates as CI). Shorthand: `npm start`.

Optional git hooks — install [pre-commit](https://pre-commit.com/) once per machine (`brew install pre-commit` or `pipx install pre-commit`), then:

```bash
pre-commit install
```

`npm ci` installs `@csark0812/skeleton` from the npm registry (see `package-lock.json`). For local skeleton dogfood only: `npm install ../skeleton` — do not commit that link.

## Layout

- Flat skills: `<slug>/SKILL.md` (e.g. `multi/SKILL.md`)
- Shared module: `src/expected-skills.ts` (canonical slug list; `npm run typecheck`)
- Tests: `tests/`
- Agent conformance suites: `agent-suites/` (`npm run agent:test`)
- Canonical shared refs: `.skeleton/references/` → `npm run references:sync` → `{slug}/references/`
- Hub taxonomy: `docs/tiers.md`, `.skeleton/registry.md`
- This clone ships team skills + skeleton config. Agent preference packs (`.cursor/` / `.claude/` prefs) live elsewhere — see [tiers](docs/tiers.md).

## Validation

| Change                            | Run                                                              |
| --------------------------------- | ---------------------------------------------------------------- |
| Hub docs (`README.md`, `docs/**`) | `npm run validate:changed -- <path>`                             |
| Shared refs                       | `npm run references:sync` then `npm run references:check`        |
| Skill bodies / unsure             | `npm run check` (or `npm test` / `audit:skills` + `validate:ci`) |
| Agent suite scenarios             | `npm run agent:test` (replay)                                    |
| Style (md/yaml)                   | `npm run lint` + `npm run format:check`                          |
| Shared `src/` TypeScript          | `npm run typecheck`                                              |

Path-scoped `validate:changed` on skill-only paths exits non-zero and redirects to `audit skills` / `audit self` (skill-body rules are global; path-scoped coverage is empty). Use `npm test` / `npm run check` for skill edits. Pre-commit runs `npm test` so local hooks match the skill gate.

`npm test` = unit fixtures + `references:check` + `audit:hub` + `audit:skills` + `validate:ci`. `npm run check` / `npm start` also runs format, lint, and typecheck (CI + First hour). Optional deeper pass: `npm run audit:self` (docs + skills; registered `SKILL.md` rows need Source of truth banner + doc-meta). Skill-path redirect needs `@csark0812/skeleton` ≥ 1.1.3.

`npm run agent:test` runs replay-based portable conformance suites for public toolbox skills. `npm run agent:test:live` uses Cursor SDK dogfood in isolated worktrees and requires `CURSOR_API_KEY`. Keep consumer/product-specific suites (for example PostPrint app paths, private docs, and repo validation commands) in the consumer repo.

## Install destinations (consumers)

| Agent       | Project           | Global              |
| ----------- | ----------------- | ------------------- |
| Cursor      | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex       | `.agents/skills/` | `~/.codex/skills/`  |

Use space-separated `--skill` names (or `--skill '*'`), not commas. Include `codex` in `--agent` when installing for Codex.

See [README](README.md) · [tiers](docs/tiers.md) · `package.json` scripts.
