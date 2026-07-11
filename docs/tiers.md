# Skill tiers

Assign each skill to exactly one tier. Update when adding skills.

## Team (`team/` → `shared.slugs` → project `.claude/skills/`)

Generic orchestration, planning, quality, workflow — shared across work + side project.

| Slug | Notes |
|------|-------|
| multi | Parallel subagent kernel |
| code-review | Council review + fix-loop |
| crystallize | Fuzzy idea → artifact |
| grill | Pressure-test design |
| second-opinion | Plan review |
| investigate | Code hunch / web research |
| product-principles | Build evaluation |
| domain-modeling | Glossary discipline |
| testing | Test write/fix/run |
| debug | Cross-layer debug |
| handoff | Session handoff |
| branch-cleanup | Branch hygiene |
| pull-request | PR description from diff |

Also vendored: `team/references/` → project `references/`

## Personal (`personal/` → global `npx skills add -g`)

| Slug | Notes |
|------|-------|
| voice | Writing tone; references `personal/raw/` for calibration |

## Sensitive (`personal/raw/` → git-crypt)

| File | Notes |
|------|-------|
| writing-samples.md | Curated voice excerpts |
| (add) slack-export-*.md | Raw exports — optional |

## Project-local only (NOT in toolbox)

Stay in each project's `.claude/skills/` — not synced from toolbox.

PostPrint examples: `k8s`, `tanstack-query`, `tanstack-router`, `brand-design`, `components`, `project-tracking`, `align-commands`
