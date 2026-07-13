# toolbox

**Source of truth for** team Cursor/Claude agent skills.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-11 -->

Public SSOT for team Cursor/Claude agent skills.

Personal skills live in the private [personal-toolbox](https://github.com/csark0812/personal-toolbox) repo. New skills start from the public [skeleton](https://github.com/csark0812/skeleton) template.

## Install

```bash
# All team skills (7 slugs), global
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code -y

# All team skills, project-scoped (commit .claude/skills/ or .cursor/skills/)
npx skills add csark0812/toolbox --skill '*' --agent cursor claude-code --copy -y

# All team skills listed in consumer skills-lock (resync replaces every lock key)
npx skills add csark0812/toolbox --skill '*' --agent cursor claude-code --copy -y

# Core dialogue/review set (subset)
npx skills add csark0812/toolbox --skill multi,code-review,crystallize,grill,second-opinion,investigate,handoff --agent cursor claude-code --copy -y

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
npx skills add csark0812/toolbox --skill multi,code-review,crystallize,grill,second-opinion,investigate,handoff -a cursor claude-code --copy -y
```

After init, edit `.skeleton/config.yaml` for your layout and run `npx skeleton audit self` to verify.

### Roles

| Piece                       | Role                                                                      |
| --------------------------- | ------------------------------------------------------------------------- |
| **toolbox** (this repo)     | Skill source SSOT — what skills exist and how they're written             |
| **skeleton**                | Docs/skill registry linter — validates links, banners, and scan perimeter |
| **`.skeleton/customize/`**  | Project-specific skill overrides (injected via IDE hooks on read)         |
| **`.skeleton/references/`** | Canonical shared reference docs — copied into each skill at build time    |

Do not edit synced `SKILL.md` files in consumer projects — override in `.skeleton/customize/<slug>.md` instead. See [skeleton customize docs](https://github.com/csark0812/skeleton/blob/main/docs/developer/customize.md).

Each skill is self-contained: shared reference docs are generated copies under `{slug}/references/` with provenance headers. Edit canonical files in `.skeleton/references/`, then run `npm run references:sync`.

## Skills

| Slug           | Purpose                                      |
| -------------- | -------------------------------------------- |
| multi          | Parallel subagent orchestration kernel       |
| code-review    | Multi-lens code review with council dispatch |
| crystallize    | Fuzzy idea → shaped intent                   |
| grill          | Pressure-test design before implementation   |
| second-opinion | Written plan review                          |
| investigate    | Confirm/refute a code or approach hunch      |
| handoff        | Compact session handoff                      |

Consumer projects may lock additional slugs (`debug`, `testing`, `product-principles`, …) — **every lock key is replaced on resync**. Portable `references/` copies are stubs; consumers map to project docs via `.skeleton/customize/` + `customize.alwaysInclude`. See [docs/tiers.md](docs/tiers.md).

## Daily workflow

```bash
cd ~/Repositories/toolbox
git pull
npx skills update -g
```

## Adding a skill

1. Create `<slug>/SKILL.md`
2. Update `docs/tiers.md`
3. If linking shared refs, use `../references/...` in source — `npm run references:sync` materializes copies
4. `npm run validate:changed -- --staged`
5. Push → CI green → `npx skills update -g`

Inter-toolbox links use relative paths (`../multi/SKILL.md`). Project-local skills must not use `/SKILL.md` links from toolbox — see [docs/tiers.md](docs/tiers.md).
