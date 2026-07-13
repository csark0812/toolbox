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
- Canonical shared refs: `.skeleton/references/` → `npm run references:sync` → `{slug}/references/`
- Hub taxonomy: `docs/tiers.md`, `.skeleton/registry.md`
- This clone ships team skills + skeleton config. Agent preference packs (`.cursor/` / `.claude/` prefs) live elsewhere — see [tiers](docs/tiers.md).

## Validation

| Change                            | Run                                                              |
| --------------------------------- | ---------------------------------------------------------------- |
| Hub docs (`README.md`, `docs/**`) | `npm run validate:changed -- <path>`                             |
| Shared refs                       | `npm run references:sync` then `npm run references:check`        |
| Skill bodies / unsure             | `npm run check` (or `npm test` / `audit:skills` + `validate:ci`) |
| Style (md/yaml)                   | `npm run lint` + `npm run format:check`                          |
| Shared `src/` TypeScript          | `npm run typecheck`                                              |

Path-scoped `validate:changed` on skill trees is a **weak/no-op** for skill-body rules (skills suite rules are global). Do not treat a green skills path as full coverage — use `npm test` / `npm run check`. Pre-commit runs `npm test` so local hooks match the skill gate.

`npm test` = unit fixtures + `references:check` + `audit:hub` + `audit:skills` + `validate:ci`. `npm run check` / `npm start` also runs format, lint, and typecheck (CI + First hour). Optional deeper pass: `npm run audit:self`.

## Install destinations (consumers)

| Agent       | Project           | Global              |
| ----------- | ----------------- | ------------------- |
| Cursor      | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex       | `.agents/skills/` | `~/.codex/skills/`  |

Use space-separated `--skill` names (or `--skill '*'`), not commas. Include `codex` in `--agent` when installing for Codex.

See [README](README.md) · [tiers](docs/tiers.md) · `package.json` scripts.
