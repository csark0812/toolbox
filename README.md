# toolbox

**Source of truth for** team Cursor/Claude agent skills.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-11 -->

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

## In a consumer repo

Two steps: skeleton validates the repo's docs/skills perimeter; toolbox supplies the skills.

```bash
# 1. SSOT audit harness (once per project)
npm install -D @csark0812/skeleton
npx skeleton init --skills

# 2. Team skills (global or project-scoped)
npx skills add csark0812/toolbox --skill '*' -a cursor claude-code -y
# or vendor a copy into the project:
./scripts/sync.sh ~/path/to/project
```

After init, edit `.skeleton/config.yaml` for your layout and run `npx skeleton audit self` to verify.

### Roles

| Piece | Role |
| ----- | ---- |
| **toolbox** (this repo) | Skill source SSOT — what skills exist and how they're written |
| **skeleton** | Docs/skill registry linter — validates links, banners, and scan perimeter |
| **`.skeleton/customize/`** | Project-specific skill overrides (injected via IDE hooks on read) |
| **`sync.sh`** | Vendors a copy of toolbox skills into `.claude/skills/` — does not replace `skeleton init` |

Do not edit synced `SKILL.md` files in consumer projects — override in `.skeleton/customize/<slug>.md` instead. See [skeleton customize docs](https://github.com/csark0812/skeleton/blob/main/docs/developer/customize.md).

### Vendor into a project repo

```bash
./scripts/sync.sh ~/path/to/project
# commit .claude/skills/ in the project
```

## Skills

| Slug               | Purpose                                      |
| ------------------ | -------------------------------------------- |
| multi              | Parallel subagent orchestration kernel       |
| code-review        | Multi-lens code review with council dispatch |
| crystallize        | Fuzzy idea → shaped intent                   |
| grill              | Pressure-test design before implementation   |
| second-opinion     | Written plan review                          |
| investigate        | Confirm/refute a code or approach hunch      |
| product-principles | Product philosophy and build evaluation      |
| domain-modeling    | Domain glossary discipline                   |
| testing            | Write, fix, and run tests                    |
| debug              | Cross-layer bug localization                 |
| handoff            | Compact session handoff                      |
| branch-cleanup     | Clean merged/stale branches and worktrees    |
| pull-request       | PR description from diff                     |

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
