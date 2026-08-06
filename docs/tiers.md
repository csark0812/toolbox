# Skill tiers

**Source of truth for** skill tier assignment across the agent harness ecosystem.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Assign each skill to exactly one **group**. Update when adding skills.

## Skill groups

Every toolbox skill is either an **orchestrator** (agent-to-agent plumbing) or a **process** skill (what the work means in natural language). One meta skill covers authoring.

### Orchestrators — agent-to-agent (A2A)

Define **how agents and sessions connect**: spawn, member envelopes, pass loops, cross-session channels. Process skills **call** orchestrators; they do not re-embed dispatch templates.

| Slug          | A2A role                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------- |
| **subagents** | Task spawn — type, splits, model routing, [context-pack](../subagents/references/context-pack.md) |
| **iterate**   | In-session pass loop — blind members, fix loop, exit gate until a bounded slice coheres           |
| **handoff**   | Cross-session channel — `channel` + `Pack` + `Goal`; pointers not bodies                          |

Dispatch recipes live under orchestrator trees (`*-dispatch.md`, `context-pack.md`, `adversarial.md`) — not under process skills.

### Process skills — what happens

Describe **what good work looks like**: intent, evidence bar, filing, output shape, routing to sibling processes. Written so a human (or coordinator) understands the job without reading spawn mechanics.

When the job needs another agent or another pass, say so in one line and point at an orchestrator — e.g. “parallel perspectives → **subagents**”, “until cohesive → **iterate**”, “continue next chat → **handoff**”.

| Slug               | Process (natural language)                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **code-review**    | Review code on any surface through any lens; file merge-blockers with evidence              |
| **second-opinion** | Multiple independent perspectives on a written plan — premise stress, completeness, defense |
| **grill**          | Walk the design tree in dialogue until major branches align                                 |
| **crystallize**    | Shape fuzzy intent through Socratic dialogue before design or build                         |
| **investigate**    | Settle one concrete hunch with primary-source evidence — verdict, not fix                   |
| **diagnose**       | Hard bug: build a tight repro loop, then fix and lock regression                            |
| **tdd**            | Test-first build at agreed public seams                                                     |
| **prototype**      | Throwaway spike for one design question (user-invoked)                                      |
| **domain-model**   | Persist glossary + ADRs when decisions are ready (user-invoked)                             |

**Optional install:** **investigate** — same process group; omitted from default bundle after 2026-07 evidence parity ([evidence-parity.md](evidence-parity.md)).

### Meta

| Slug                     | Role                                      |
| ------------------------ | ----------------------------------------- |
| **writing-great-skills** | Skill-authoring vocabulary (user-invoked) |

## Typical chains (process → orchestrator)

Process skills name the arc; orchestrators wire the agents.

| User intent                        | Process skill(s)              | Orchestrator when needed                        |
| ---------------------------------- | ----------------------------- | ----------------------------------------------- |
| “Is this plan sound?”              | **second-opinion**            | **subagents** — parallel attackers + defender   |
| “Make this module hold together”   | (review filing → code-review) | **iterate** — blind passes until slice coheres  |
| “Review my PR”                     | **code-review**               | **subagents** — optional parallel lenses        |
| “Context full — continue tomorrow” | (any)                         | **handoff** — `Pack: pointers` or `fix-loop`    |
| “Pressure-test this design”        | **grill**                     | **subagents** — optional repo explore only      |
| “Is this hunch true?”              | **investigate**               | **subagents** — optional parallel gather/stress |

## Team (`toolbox/`)

Generic orchestration, planning, and dialogue — intended for any consumer project.

Shared ambient refs live in [`.skeleton/references/`](../.skeleton/references/) and are opened from skills via GitHub raw URLs (network required). See [github-ambient-refs-validation.md](github-ambient-refs-validation.md). Soft-default planning recipes stay out of skill trees — enable via [`templates/planning-soft-default/`](../templates/planning-soft-default/) + [`templates/soft-default-planning.md`](../templates/soft-default-planning.md) only when the consumer has no planning docs remap.

### Consumer setup

Skeleton and toolbox are complementary — init skeleton first, then install skills:

```bash
npm install -D @csark0812/skeleton
npx skeleton init --skills
npx skills add csark0812/toolbox --skill subagents code-review crystallize grill second-opinion iterate diagnose tdd prototype domain-model handoff writing-great-skills -a cursor claude-code codex --copy -y
```

Optional — install when you need explicit hunch→verdict routing (not in default bundle after 2026-07 evidence parity):

```bash
npx skills add csark0812/toolbox --skill investigate -a cursor claude-code codex --copy -y
```

- **toolbox** — skill content SSOT (this repo)
- **skeleton** — validates docs, registries, and skill links in the consumer project
- **`.skeleton/customize/`** — project overrides; hooks inject on skill read

Install destinations: Cursor project → `.agents/skills/` (global → `~/.cursor/skills/`); Claude Code project → `.claude/skills/` (global → `~/.claude/skills/`); Codex project → `.agents/skills/` (global → `~/.codex/skills/`). Put project-specific customize stubs and council overlays in the consumer repo, not here.

### Migration notes

**Code-review (2026-07):** Process-only — spawn and slice loops → **subagents** / **iterate**. See [code-review/SKILL.md](../code-review/SKILL.md).

**Second-opinion (pending):** Still embeds staged-debate dispatch in skill refs — target is process-only body + **subagents** `second-opinion-dispatch.md` (same split as code-review).

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
