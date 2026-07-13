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

## Layout

- Flat skills: `<slug>/SKILL.md` (e.g. `multi/SKILL.md`)
- Canonical shared refs: `.skeleton/references/` → `npm run references:sync` → `{slug}/references/`
- Hub taxonomy: `docs/tiers.md`, `.skeleton/registry.md`

## Validation

| Change | Command |
| ------ | ------- |
| Hub docs (`README.md`, `docs/**`) | `npm run validate:changed -- <path>` |
| Shared refs | `npm run references:sync` then `npm run references:check` |
| Skill bodies / unsure | `npm test` (or `npm run audit:skills` + `npm run validate:ci`) |

Path-scoped `validate:changed` on skill trees is a **weak/no-op** for skill-body rules (skills suite rules are global). Do not treat a green skills path as full coverage.

`npm test` = `references:check` + `audit:hub` + `audit:skills` + `validate:ci`. That is the skill gate. Optional deeper pass: `npm run audit:self` (full self suite; not required by `test` because hub+skills+CI already cover the shipping perimeter).

## Install destinations (consumers)

| Agent | Project | Global |
| ----- | ------- | ------ |
| Cursor | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |

See [README](README.md) · [tiers](docs/tiers.md) · `package.json` scripts.
