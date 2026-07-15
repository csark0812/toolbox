# Skill tiers

**Source of truth for** skill tier assignment across the agent harness ecosystem.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-15 -->

Assign each skill to exactly one place. Update when adding skills.

## Team (`toolbox/`)

Generic orchestration, planning, and dialogue — intended for any consumer project.

| Slug           | Notes                                        |
| -------------- | -------------------------------------------- |
| multi          | Parallel subagent kernel                     |
| code-review    | Council review + fix-loop (customize roster) |
| crystallize    | Fuzzy idea → artifact                        |
| grill          | Pressure-test design                         |
| second-opinion | Plan review                                  |
| investigate    | Code hunch / web research                    |
| handoff        | Session handoff                              |

Shared ambient refs live in [`.skeleton/references/`](../.skeleton/references/) and are opened from skills via GitHub raw URLs (network required). See [github-ambient-refs-validation.md](github-ambient-refs-validation.md). Soft-default planning recipes stay out of skill trees — enable via [`templates/planning-soft-default/`](../templates/planning-soft-default/) + [`templates/soft-default-planning.md`](../templates/soft-default-planning.md) only when the consumer has no planning docs remap.

### Consumer setup

Skeleton and toolbox are complementary — init skeleton first, then install skills:

```bash
npm install -D @csark0812/skeleton
npx skeleton init --skills
npx skills add csark0812/toolbox --skill multi code-review crystallize grill second-opinion investigate handoff -a cursor claude-code codex --copy -y
```

- **toolbox** — skill content SSOT (this repo)
- **skeleton** — validates docs, registries, and skill links in the consumer project
- **`.skeleton/customize/`** — project overrides; hooks inject on skill read

Install destinations: Cursor project → `.agents/skills/` (global → `~/.cursor/skills/`); Claude Code project → `.claude/skills/` (global → `~/.claude/skills/`); Codex project → `.agents/skills/` (global → `~/.codex/skills/`). Put project-specific customize stubs and council overlays in the consumer repo, not here.

Distribution:

```bash
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code codex -y
npx skills update -g
```

## Consumer-local only (NOT in toolbox)

Stay in each project's skill directory — not synced from toolbox. Typical examples: product domain skills, deployment/ops playbooks, framework or stack helpers, issue-tracker or PR conventions, design-system skills.

## Personal / private skills

Individual preferences and private skills live outside this public repo (often a separate private skills package + global `skills add`). Do not publish them here.

## Skeleton (`skeleton/` → SSOT audit CLI)

Published npm package for docs/skill registry validation. See [skeleton](https://github.com/csark0812/skeleton). The package skill lives in the skeleton repo (`skeleton/SKILL.md`); do not expect a `skeleton/` tree inside this toolbox checkout.
