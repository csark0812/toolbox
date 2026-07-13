# Agent entry (toolbox)

**Source of truth for** agent cold-start in this repo.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

Public team skills SSOT. Markdown skills + skeleton audits — not a TypeScript app.

## First hour

Requires **Node ≥ 22**.

```bash
npm ci
npm test
```

Optional git hooks — install [pre-commit](https://pre-commit.com/) once per machine (`brew install pre-commit` or `pipx install pre-commit`), then:

```bash
pre-commit install
```

`npm ci` installs `@csark0812/skeleton` from the npm registry (see `package-lock.json`). For local skeleton dogfood only: `npm install ../skeleton` — do not commit that link.

## Layout

- Flat skills: `<slug>/SKILL.md` (e.g. `multi/SKILL.md`)
- Canonical shared refs: `.skeleton/references/` → `npm run references:sync` → `{slug}/references/`
- Hub taxonomy: `docs/tiers.md`, `.skeleton/registry.md`
- This clone ships team skills + skeleton config. Agent preference packs (`.cursor/` / `.claude/` prefs) live elsewhere — see [tiers](docs/tiers.md).

## Validation

| Change | Run |
| ------ | --- |
| Hub docs (`README.md`, `docs/**`) | `npm run validate:changed -- <path>` |
| Shared refs | `npm run references:sync` then `npm run references:check` |
| Skill bodies / unsure | `npm test` (or `npm run audit:skills` + `npm run validate:ci`) |
| Style (md/yaml) | `npm run lint` + `npm run format:check` |

Path-scoped `validate:changed` on skill trees is a **weak/no-op** for skill-body rules (skills suite rules are global). Do not treat a green skills path as full coverage — use `npm test`. Pre-commit runs `npm test` so local hooks match the skill gate.

`npm test` / `npm run check` = unit fixtures + `references:check` + `audit:hub` + `audit:skills` + `validate:ci`. That is the skill gate. Optional deeper pass: `npm run audit:self`.

## Install destinations (consumers)

| Agent | Project | Global |
| ----- | ------- | ------ |
| Cursor | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex | `.agents/skills/` | `~/.codex/skills/` |

Use space-separated `--skill` names (or `--skill '*'`), not commas. Include `codex` in `--agent` when installing for Codex.

See [README](README.md) · [tiers](docs/tiers.md) · `package.json` scripts.
