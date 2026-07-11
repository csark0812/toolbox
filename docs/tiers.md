# Skill tiers

Assign each skill to exactly one repo. Update when adding skills.

## Team (`toolbox/team/` → `shared.slugs`)

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

Distribution:

- **npx skills:** `npx skills add https://github.com/csark0812/toolbox/tree/main/team`
- **Vendor:** `./scripts/sync.sh <project-root>`

## Personal (`personal-toolbox/personal/` → global install)

Private repo. See [personal-toolbox](https://github.com/csark0812/personal-toolbox).

| Slug | Notes |
|------|-------|
| voice | Writing tone; references `personal/raw/` for calibration |

Distribution:

```bash
npx skills add https://github.com/csark0812/personal-toolbox/tree/main/personal --skill voice -g --agent cursor claude-code
npx skills update -g
```

## Project-local only (NOT in toolbox)

Stay in each project's `.claude/skills/` — not synced from toolbox.

PostPrint examples: `k8s`, `tanstack-query`, `tanstack-router`, `brand-design`, `components`, `project-tracking`, `align-commands`
