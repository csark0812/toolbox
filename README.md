# toolbox

Public SSOT for team Cursor/Claude agent skills.

Personal skills live in the private [personal-toolbox](https://github.com/csark0812/personal-toolbox) repo.

## Install

### npx skills (recommended)

Project-scoped (e.g. applications):

```bash
npx skills add https://github.com/csark0812/toolbox/tree/main/team --agent cursor claude-code
npx skills update -p
```

### Vendor into a project repo

```bash
./scripts/sync.sh ~/path/to/project
# commit .claude/skills/ in the project
```

## Skills

| Slug | Purpose |
|------|---------|
| multi | Parallel subagent orchestration kernel |
| code-review | Multi-lens code review with council dispatch |
| crystallize | Fuzzy idea → shaped intent |
| grill | Pressure-test design before implementation |
| second-opinion | Written plan review |
| investigate | Confirm/refute a code or approach hunch |
| product-principles | Product philosophy and build evaluation |
| domain-modeling | Domain glossary discipline |
| testing | Write, fix, and run tests |
| debug | Cross-layer bug localization |
| handoff | Compact session handoff |
| branch-cleanup | Clean merged/stale branches and worktrees |
| pull-request | PR description from diff |

Also included: `team/references/` (shared planning, routing, dialogue docs).

See [docs/tiers.md](docs/tiers.md) for tier assignment rules.

## Daily workflow

```bash
cd ~/Repositories/toolbox
git pull

# Option A: update project install
cd ~/path/to/project && npx skills update -p

# Option B: vendor + commit
~/Repositories/toolbox/scripts/sync.sh ~/path/to/project
```

## Adding a skill

1. Create `team/<slug>/SKILL.md`
2. Add slug to `shared.slugs`
3. Update `docs/tiers.md`
4. Push, then `npx skills update -p` or `./scripts/sync.sh` in target projects
