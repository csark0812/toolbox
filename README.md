# toolbox

Public SSOT for team Cursor/Claude agent skills.

Personal skills live in the private [personal-toolbox](https://github.com/csark0812/personal-toolbox) repo. New skills start from the public [skeleton](https://github.com/csark0812/skeleton) template.

## Install

```bash
# All team skills, global
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code -y

# All team skills, project-scoped
npx skills add csark0812/toolbox --skill '*' --agent cursor claude-code -y

# Update after push
npx skills update -g   # global
npx skills update -p   # project
```

Shorthand for `https://github.com/csark0812/toolbox`. The `@` prefix (npm-style scopes) is not supported by the skills CLI — use `csark0812/toolbox`.

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

Also included: `references/` (shared planning, routing, dialogue docs).

See [docs/tiers.md](docs/tiers.md) for tier assignment rules.

## Daily workflow

```bash
cd ~/Repositories/toolbox
git pull
npx skills update -g
```

## Adding a skill

1. Create `<slug>/SKILL.md`
2. Add slug to `shared.slugs`
3. Update `docs/tiers.md`
4. Push, then `npx skills update -g` or `./scripts/sync.sh` in target projects
