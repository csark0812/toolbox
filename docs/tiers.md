# Skill tiers

**Source of truth for** skill tier assignment across the agent harness ecosystem.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Assign each skill to exactly one **group**. Update when adding skills.

## Skill groups

Every toolbox skill is either an **orchestrator** (agent-to-agent plumbing) or a **process** skill (what the work means in natural language). One meta skill covers authoring.

**Composition:** Skills compose via **layered prompts** — attach multiple skills or name several modes on the same `Slice` / `Artifact`. Shared vocabulary → [context-pack.md](../subagents/references/context-pack.md). No chains table; each skill defines entry gates and exit artifacts only.

### Orchestrators — agent-to-agent (A2A)

Define **how agents and sessions connect**: spawn, member envelopes, pass loops, cross-session channels. Process skills **call** orchestrators when their own recipe mandates spawn; they do not re-embed dispatch templates.

| Slug          | A2A role                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- |
| **subagents** | Task spawn — type, splits, ≤100k context, [context-pack](../subagents/references/context-pack.md) |
| **iterate**   | In-session pass loop — blind members, fix loop, exit gate until a bounded slice coheres           |
| **handoff**   | Cross-session channel — `channel` + `Pack` + `Goal`; pointers not bodies                          |

Dispatch recipes live under orchestrator trees (`*-dispatch.md`, `context-pack.md`, `adversarial.md`) — not under process skills.

### Process skills — atoms

Each process skill is an **atom**: entry gate → non-negotiables → workflow → exit artifact → non-goals (frontmatter `Not …`). Atoms stack on overlapping **Slice** / **Artifact** / **Seam** without naming siblings.

| Slug               | Atom (natural language)                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| **code-review**    | Review code on any surface through any lens; file merge-blockers with evidence                    |
| **second-opinion** | Multiple independent perspectives on a written plan — premise stress, completeness, defense       |
| **crystallize**    | Shape fuzzy intent through Socratic dialogue — crystallized statement, not solutions yet          |
| **grill**          | Shape fuzzy intent (intent phase) and walk the design tree in dialogue until major branches align |
| **probe**          | Hunch verdict (Evidence) or hard-bug fix (Fix) under Authority B — tight **Repro** before patch   |
| **tdd**            | Test-first build at agreed public seams — red-green on a **Slice**                                |
| **prototype**      | Throwaway spike for one design question (user-invoked)                                            |
| **domain-model**   | Persist glossary + ADRs when a decision is ready (user-invoked)                                   |

### Meta

| Slug                     | Role                                      |
| ------------------------ | ----------------------------------------- |
| **writing-great-skills** | Skill-authoring vocabulary (user-invoked) |

## Team (`toolbox/`)

Generic orchestration, planning, and dialogue — intended for any consumer project.

Shared ambient refs live in [`.skeleton/references/`](../.skeleton/references/) and are opened from skills via GitHub raw URLs (network required). See [github-ambient-refs-validation.md](github-ambient-refs-validation.md). Soft-default planning recipes stay out of skill trees — enable via [`templates/planning-soft-default/`](../templates/planning-soft-default/) + [`templates/soft-default-planning.md`](../templates/soft-default-planning.md) only when the consumer has no planning docs remap.

### Consumer setup

Skeleton and toolbox are complementary — init skeleton first, then install skills:

```bash
npm install -D @csark0812/skeleton
npx skeleton init --skills
npx skills add csark0812/toolbox --skill subagents code-review crystallize grill second-opinion iterate probe tdd prototype domain-model handoff writing-great-skills -a cursor claude-code codex --copy -y
```

- **toolbox** — skill content SSOT (this repo)
- **skeleton** — validates docs, registries, and skill links in the consumer project
- **`.skeleton/customize/`** — project overrides; hooks inject on skill read

Install destinations: Cursor project → `.agents/skills/` (global → `~/.cursor/skills/`); Claude Code project → `.claude/skills/` (global → `~/.claude/skills/`); Codex project → `.agents/skills/` (global → `~/.codex/skills/`). Put project-specific customize stubs and council overlays in the consumer repo, not here.

### Migration notes

**Atomic composition (2026-08):** Retired cross-skill routing tables and chain docs. Compose via [context-pack.md](../subagents/references/context-pack.md) primitives + layered prompts.

**Process vs orchestrator (2026-08):** Dispatch refs live under **subagents** (`second-opinion-dispatch`, `explore-escalation-dispatch`, `review-council-dispatch`) or orchestrators (`iterate`, `handoff`). Hunch settlement uses coordinator **explore** + ambient [verdict.md](../.skeleton/references/verdict.md) (retired **investigate** slug).

**Code-review (2026-07):** Process-only — see [code-review/SKILL.md](../code-review/SKILL.md).

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
