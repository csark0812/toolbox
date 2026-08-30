# Skill tiers

<!-- source-of-truth: skill tier assignment across the agent harness ecosystem. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-30 -->

Assign each skill to exactly one **group**. Update when adding skills.

## Skill groups

Every toolbox skill is either an **orchestrator** (agent-to-agent plumbing) or a **process** skill (what the work means in natural language). One meta skill covers authoring.

**Composition:** Skills compose via **layered prompts** — attach multiple skills or name several modes on the same `Slice` / `Artifact`. Shared vocabulary → [context-pack.md](../council/references/context-pack.md). No chains table; each skill defines entry gates and exit artifacts only.

### Orchestrators — agent-to-agent (A2A)

Define **how agents and sessions connect**: multi-perspective spawn, member envelopes, cross-session channels. Process skills stay atoms; they do not embed dispatch templates. Multi-agent depth requires attaching **council**.

| Slug        | A2A role                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **council** | In-session multi-agent depth — invent perspectives, spawn Task members, synthesize ([context-pack](../council/references/context-pack.md)) |
| **handoff** | Cross-session channel — `channel` + `Pack` + `Goal`; pointers not bodies                                                                   |

Dispatch and pack refs live under orchestrator trees (`context-pack.md`, `adversarial.md`, handoff `*-dispatch.md`) — not under process skills.

### Process skills — atoms

Each process skill is an **atom**: entry gate → non-negotiables → workflow → exit artifact → non-goals (frontmatter `Not …`). Atoms stack on overlapping **Slice** / **Artifact** / **Seam** without naming siblings.

| Slug                   | Atom (natural language)                                                                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **code-review**        | Review code on any surface through any lens; file merge-blockers with evidence. When a consumer-local review/standards skill is also loaded, stack both opinions (neither replaces the other). |
| **review-walkthrough** | Explain a bounded code change one behavior at a time with evidence anchors; do not make merge-readiness claims.                                                                                |
| **second-opinion**     | Adversarial critique of a written artifact — invent lenses; single-pass by default; layer **council** for multi-perspective depth                                                              |
| **grill**              | Shape fuzzy intent (intent phase) and walk the design tree in dialogue until major branches align                                                                                              |
| **probe**              | Hunch verdict (Evidence) or hard-bug fix (Fix) under Authority B — tight **Repro** before patch                                                                                                |
| **tdd**                | Test-first build at agreed public seams — red-green on a **Slice**                                                                                                                             |
| **prototype**          | Throwaway spike for one design question                                                                                                                                                        |
| **domain-model**       | Persist glossary + ADRs when a decision is ready                                                                                                                                               |
| **refactor-companion** | Guide an intent-led refactor in small slices from design through simplification and handoff                                                                                                    |

## Process SSOT (`toolbox/`)

This repo is the public home for process and orchestrator skills. Install them **user-level** with `-g` (ownership/install norm — not a CI pin or lockfile). Product repos should not vendor those skill folders.

| Tier                    | Where                             | Install                          |
| ----------------------- | --------------------------------- | -------------------------------- |
| Process + orchestrators | this repo (`csark0812/toolbox`)   | Global only (`-g`) for engineers |
| Private prefs           | separate global install (unnamed) | Global only                      |
| Product + standards     | consumer repo skill dirs          | In-repo only                     |

Private preference skills live in a separate global install outside this repo. Do not name that other home from hub docs here.

Soft-default planning recipes stay out of skill trees — hosted here as a **copyable template** under [`templates/planning-soft-default/`](../templates/planning-soft-default/) + [`templates/soft-default-planning.md`](../templates/soft-default-planning.md). After opt-in they live in the consumer (`.skeleton/customize/` **or** a consumer-local skill). Not a process skill installed by `--skill '*'`. Fail-loud stubs stay ambient; see [github-ambient-refs-validation.md](github-ambient-refs-validation.md).

Shared ambient refs live in [`.skeleton/references/`](../.skeleton/references/) and are opened from skills via GitHub raw URLs (network required).

### Install (global only)

```bash
# Process / orchestrators — user-level (`*` = registered skill slugs only)
npx skills add csark0812/toolbox --skill '*' -g --agent cursor claude-code codex -y
npx skills update -g

# Optional in a consumer: skeleton audit scaffolding only (does not install toolbox skills)
npm install -D @csark0812/skeleton
npx skeleton init --skills
```

- **toolbox** — process skill content SSOT (this repo); engineers install with `-g`
- **skeleton** — validates docs, registries, and skill links; `init --skills` configures the audit perimeter only
- **`.skeleton/customize/`** — consumer-local overlays (product docs, alwaysInclude, soft-default binders) — **consumer repos only**

Install destinations (where agents look): Cursor project → `.agents/skills/` (global → `~/.cursor/skills/`); Claude Code project → `.claude/skills/` (global → `~/.claude/skills/`); Codex project → `.agents/skills/` (global → `~/.codex/skills/`). Toolbox **process** skills go in **Global**. Project skill dirs are for consumer product/standards skills (and planning overlays), not vendored toolbox process copies.

**Clone dogfood:** project sync of toolbox process skills is allowed **only inside this toolbox clone** while authoring — not a consumer install path.

Process SSOT updates via global install / this repo — not “edit installed copies in a consumer.” Customize overlays remain for consumer-local product context.

### Migration (2026-08) — ownership cut

Existing project-scoped `--copy` trees of toolbox process skills keep loading until removed. Hub no longer recommends that path.

1. **Remove** vendored copies of registered toolbox skill slugs under project skill dirs (do not keep dual project+global process installs).
2. Engineers **reinstall** via global `-g`.
3. **Keep** consumer product / standards / planning-overlay skills in-repo. `.skeleton/customize/` soft-default overlays are not process skill dirs.
4. Leftover project-scoped toolbox process copies are **unsupported** as a taught path after this framing lands.

Consumer cleanup PRs (delete vendored dirs in other repos) are separate — this hub only teaches the recipe.

### Migration notes (skill taxonomy)

**Atomic composition (2026-08):** Retired cross-skill routing tables and chain docs. Compose via [context-pack.md](../council/references/context-pack.md) primitives + layered prompts.

**Council + ownership (2026-08):** Retired **subagents** and **iterate**. **Council** owns in-session multi-agent depth (invent perspectives, spawn, synthesize). **Second-opinion** is single-pass by default; multi-perspective depth only when the user also attaches **council**. Hunch settlement uses coordinator **explore** + ambient [verdict.md](../.skeleton/references/verdict.md) (retired **investigate** slug). Cross-session transfer stays **handoff**.

**Crystallize (2026-08):** Retired — use **grill** intent phase ([intent-phase.md](../grill/references/intent-phase.md)) for fuzzy intent; design-tree pressure-test stays in grill protocol.

**Code-review (2026-07):** Process-only — see [code-review/SKILL.md](../code-review/SKILL.md). When a consumer-local review/standards skill is also loaded, stack both (composition example; general stacking already exists).

**User-level process SSOT (2026-08):** Process skills install global-only for engineers; product repos own product + standards skills; prefs unnamed from this hub.

## Product + standards (consumer repos)

Stay in each project's skill directory — not synced from toolbox. Typical examples: product domain skills, deployment/ops playbooks, framework or stack helpers, issue-tracker or PR conventions, design-system skills, and planning overlays after soft-default opt-in.

## Skeleton (`skeleton/` → SSOT audit CLI)

Published npm package for docs/skill registry validation. See [skeleton](https://github.com/csark0812/skeleton). The package skill lives in the skeleton repo (`skeleton/SKILL.md`); do not expect a `skeleton/` tree inside this toolbox checkout. `npx skeleton init --skills` sets up audit/registry scaffolding only — it does not install toolbox process skills.
