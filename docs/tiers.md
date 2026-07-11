# Skill tiers

**Source of truth for** skill tier assignment across the agent harness ecosystem.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-11 -->

Assign each skill to exactly one repo. Update when adding skills.

## Team (`toolbox/`)

Generic orchestration, planning, and dialogue — shared across PostPrint, Popl, and other consumers.

| Slug           | Notes                                      |
| -------------- | ------------------------------------------ |
| multi          | Parallel subagent kernel                   |
| code-review    | Council review + fix-loop (customize roster) |
| crystallize    | Fuzzy idea → artifact                      |
| grill          | Pressure-test design                       |
| second-opinion | Plan review                                |
| investigate    | Code hunch / web research                  |
| handoff        | Session handoff                            |

Shared reference docs live in `.skeleton/references/` and are materialized into each skill's `references/` directory via `skeleton references sync`.

### Consumer setup

Skeleton and toolbox are complementary — init skeleton first, then install skills:

```bash
npm install -D @csark0812/skeleton
npx skeleton init --skills
npx skills add csark0812/toolbox --skill multi,code-review,crystallize,grill,second-opinion,investigate,handoff -a cursor claude-code --copy -y
```

- **toolbox** — skill content SSOT (this repo)
- **skeleton** — validates docs, registries, and skill links in the consumer project
- **`.skeleton/customize/`** — project overrides; hooks inject on skill read

**Popl notes:** skills install to `.cursor/skills/`; customize stubs for ClickUp, `verify-changes`, mobile council agents.

Distribution:

```bash
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code -y
npx skills update -g
```

## Consumer-local only (NOT in toolbox)

Stay in each project's skill directory — not synced from toolbox.

**PostPrint examples:** `branch-cleanup`, `product-principles`, `testing`, `pull-request`, `domain-modeling`, `debug`, `k8s`, `tanstack-query`, `tanstack-router`, `brand-design`, `components`, `project-tracking`, `align-commands`

**Popl examples:** `ota-update`, `release-notes`, `qa-plan`, `debugging-devices`, `verify-changes`, `address-comments`, `project-tracking`, `pull-request`, `branch-cleanup`

## Personal (`personal-toolbox/` → global install)

Private repo. See [personal-toolbox](https://github.com/csark0812/personal-toolbox).

| Slug  | Notes                                            |
| ----- | ------------------------------------------------ |
| voice | Writing tone; references `refs/` for calibration |

Distribution:

```bash
npx skills add csark0812/personal-toolbox --skill voice -g --agent cursor claude-code -y
npx skills update -g
```

## Skeleton (`skeleton/` → SSOT audit CLI)

Published npm package for docs/skill registry validation. See [skeleton](https://github.com/csark0812/skeleton).

| Slug     | Notes                                     |
| -------- | ----------------------------------------- |
| skeleton | SSOT audit CLI skill — installed via init |

Consumer setup:

```bash
npm install -D @csark0812/skeleton
npx skeleton init --skills
npx skeleton audit self
```

Copy `skeleton/` from the repo when authoring a new skill package from the template.
