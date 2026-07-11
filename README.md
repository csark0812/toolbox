# toolbox

Private SSOT for Cursor/Claude agent skills.

## Tiers

| Tier | Path | Distribution |
|------|------|--------------|
| **Team** | `team/<slug>/` | Vendored into project `.claude/skills/` via `scripts/sync.sh` — committed for coworkers |
| **Personal** | `personal/<slug>/` | Global install only (`npx skills add -g`) — never in project repos |
| **Sensitive** | `personal/raw/**` | git-crypt encrypted; Slack exports, writing samples, identity source material |

Distilled rules live in `personal/<slug>/SKILL.md`. Sensitive source material never goes in team skills or SKILL.md bodies.

## Prerequisites

```bash
brew install git-crypt gnupg
gh auth login   # for clone/push
```

## New machine

```bash
# 1. Import GPG key (see docs/gpg-second-machine.md)
gpg --import ~/path/to/toolbox-gpg-secret.asc

# 2. Bootstrap
git clone git@github.com:csark0812/toolbox.git ~/Repositories/toolbox
~/Repositories/toolbox/scripts/bootstrap.sh
```

Personal skills symlink to `~/.agents/skills/` (Cursor) and `~/.claude/skills/` (Claude Code).

## Daily workflow

Edit skills in this repo, then propagate:

```bash
cd ~/Repositories/toolbox
git pull && git-crypt unlock   # if encrypted files changed

# Team skills → project repos
./scripts/sync.sh ~/path/to/work-repo
./scripts/sync.sh ~/path/to/side-project
# commit in each project

# Personal skills: live via ~/.cursor/skills symlinks after git pull
```

Work-repo and side-project never sync to each other — both pull from toolbox.

## Security

- Private repo, solo access
- `personal/raw/**` encrypted with git-crypt (opaque even if hub access is granted later)
- Sync script uses allowlist (`shared.slugs`) — never mirrors entire tree into projects
