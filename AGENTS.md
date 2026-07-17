# Agent entry (toolbox)

**Source of truth for** agent cold-start in this repo.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-15 -->

Public team skills SSOT. Markdown skills + skeleton audits — not a TypeScript app. No runtime env vars required (see `.env.example`).

## Routing announce (before tools)

Full contracts: [`.skeleton/references/agent-routing.md`](.skeleton/references/agent-routing.md). Do **not** search the repo for that file before announcing — use this section (or the injected harness contract).

- **Hands-on:** first assistant line includes the tier, e.g. `Low — …` / `Medium — …` / `Tier: low — …`.
- **Hands-off (PR create/update/draft):** always **Medium** (or High if scope warrants) — never Low. First output is exactly:

```markdown
## Routing

- **Tier:** Low | Medium | High
- **Signals:** …
- **Invariant applied:** …
- **Escalations:** none | …
- **Open questions:** none | …
```

No tools, file edits, or other prose until the announce is done. **Then continue the task** (diff review, investigation, PR draft, etc.) — announce is not the end of the turn. Only **PR-text-only** asks (write/update PR body with no repo investigation) stay documentation-only with no tools. Review-only / no-edits still means: use tools to read diffs and skills, then write the review.

## First hour

Requires **Node ≥ 22**.

```bash
npm ci
npm run check
```

`npm run check` = format + lint + typecheck + unit fixtures + hub/skills audits + `validate:ci` (same gates as CI). Shorthand: `npm start`.

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
- Canonical ambient refs: `.skeleton/references/` — skills link via GitHub raw URLs (see [docs/github-ambient-refs-validation.md](docs/github-ambient-refs-validation.md)); no per-skill materialization
- Hub taxonomy: `docs/tiers.md`, `.skeleton/registry.md`
- This clone ships team skills + skeleton config. Agent preference packs (`.cursor/` / `.claude/` prefs) live elsewhere — see [tiers](docs/tiers.md).

## Validation

| Change                            | Run                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Hub docs (`README.md`, `docs/**`) | `npm run validate:changed -- <path>`                                                  |
| Ambient shared refs               | Edit `.skeleton/references/`; skill bodies already point at raw GitHub URLs on `main` |
| Skill bodies / unsure             | `npm run check` (or `npm test` / `audit:skills` + `validate:ci`)                      |
| Agent suite scenarios             | `npm run agent:test` (replay)                                                         |
| Style (md/yaml)                   | `npm run lint` + `npm run format:check`                                               |
| Shared `src/` TypeScript          | `npm run typecheck`                                                                   |

Path-scoped `validate:changed` on skill-only paths exits non-zero and redirects to `audit skills` / `audit self` (skill-body rules are global; path-scoped coverage is empty). Use `npm test` / `npm run check` for skill edits. Pre-commit runs `npm test` so local hooks match the skill gate.

`npm test` = unit fixtures + `audit:hub` + `audit:skills` + `validate:ci`. `npm run check` / `npm start` also runs format, lint, and typecheck (CI + First hour). Optional deeper pass: `npm run audit:self` (docs + skills; registered `SKILL.md` rows need Source of truth banner + doc-meta). Skill-path redirect needs `@csark0812/skeleton` ≥ 1.1.3.

`npm run agent:test` runs replay-based portable conformance suites for public toolbox skills. `npm run agent:test:live` uses Cursor SDK dogfood in isolated worktrees and requires `CURSOR_API_KEY`. `npm run agent:test:live:debug` adds verbose failures and keeps staging under `$TMPDIR/agent-spec` by default (see `agent-suites/README.md`). Keep consumer/product-specific suites (for example PostPrint app paths, private docs, and repo validation commands) in the consumer repo.

## Install destinations (consumers)

| Agent       | Project           | Global              |
| ----------- | ----------------- | ------------------- |
| Cursor      | `.agents/skills/` | `~/.cursor/skills/` |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex       | `.agents/skills/` | `~/.codex/skills/`  |

Use space-separated `--skill` names (or `--skill '*'`), not commas. Include `codex` in `--agent` when installing for Codex.

See [README](README.md) · [tiers](docs/tiers.md) · `package.json` scripts.
