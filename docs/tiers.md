# Skill tiers

Assign each skill to exactly one repo. Update when adding skills.

## Team (`toolbox/` → `shared.slugs`)

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

Also vendored: `references/` → project `references/`

Distribution:

```bash
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code -y
npx skills update -g
```

Or vendor: `./scripts/sync.sh <project-root>`

## Personal (`personal-toolbox/` → global install)

Private repo. See [personal-toolbox](https://github.com/csark0812/personal-toolbox).

| Slug | Notes |
|------|-------|
| voice | Writing tone; references `refs/` for calibration |

Distribution:

```bash
npx skills add csark0812/personal-toolbox --skill voice -g --agent cursor claude-code -y
npx skills update -g
```

## Project-local only (NOT in toolbox)

Stay in each project's `.claude/skills/` — not synced from toolbox.

PostPrint examples: `k8s`, `tanstack-query`, `tanstack-router`, `brand-design`, `components`, `project-tracking`, `align-commands`

## Skeleton (`skeleton/` → template)

Public starter for new skill repos. See [skeleton](https://github.com/csark0812/skeleton).

| Slug | Notes |
|------|-------|
| skill | Example/template skill — rename when copying |

Distribution:

```bash
npx skills add csark0812/skeleton --skill skill -g --agent cursor claude-code -y
```

Copy the repo or `skill/` directory when authoring a new skill package.
