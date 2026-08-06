---
name: code-review
description: How to review code — any surface and any user-named lens. Evidence bar, filing, output shape. Use when reviewing code as primary or subagent. Not find-only hunches (probe), slice cohesion loops (iterate), or plan debate (second-opinion). Spawn orchestration in subagents; iterative closure in iterate.
---

# Code review

**Source of truth for** how to review code and file findings — not how to orchestrate loops or acquire work (orchestrator + surface adapters).

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Guidelines for a **review agent or subagent**. Parent coordinator owns spawn and fix loops unless the user asked this agent to fix.

References: [review.md](references/review.md) · [sources.md](references/sources.md) · [merge-blockers.md](references/merge-blockers.md) · [output.md](references/output.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating a filing or evidence claim. Do not load by habit.

## Quick reference

| Need              | Reference                                                    |
| ----------------- | ------------------------------------------------------------ |
| Review procedure  | [references/review.md](references/review.md)                 |
| Acquire materials | [references/sources.md](references/sources.md)               |
| Default filing    | [references/merge-blockers.md](references/merge-blockers.md) |
| Output shape      | [references/output.md](references/output.md)                 |

## Non-negotiables

1. **Review only** unless the user explicitly asked to fix — do not edit files or commit during review.
2. **Evidence** — cite `path:line` for every Action item; match evidence bar to surface shape ([review.md](references/review.md)).
3. **Merge-blockers default** — reachable production bugs and security flaws in scope ([merge-blockers.md](references/merge-blockers.md)); cleanliness/style only with improvements lens or explicit user ask.
4. **Prefer no finding over speculation** — each Action claim needs trigger, impact, and counter-evidence checked.

## Workflow

1. **Acquire surface** — [sources.md](references/sources.md): closest adapter + actual scope in header; set `Lens:` from user wording (not limited to a fixed list).
2. **Review** — [review.md](references/review.md): trace behavior for the active lens.
3. **File** — [merge-blockers.md](references/merge-blockers.md) + [output.md](references/output.md).

Parallel members → parent uses [`subagents`](../subagents/SKILL.md); each member loads this skill for **how** to review. Cohesion thrash on a bounded area → [`iterate`](../iterate/SKILL.md); single hunch → [`probe`](../probe/SKILL.md).

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
