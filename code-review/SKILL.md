---
name: code-review
description: How to review code — any surface and any user-named lens. Evidence bar, filing, output shape. Composes on the same Slice as tdd and iterate. Not find-only hunch settlement, blind slice pass ownership, or written-plan perspective debate.
---

# Code review

**Source of truth for** how to review code and file findings — not agent-to-agent spawn (→ **subagents**) or blind slice pass loops (→ **iterate**).

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — shared vocabulary → [context-pack.md](../subagents/references/context-pack.md).

References: [review.md](references/review.md) · [sources.md](references/sources.md) · [merge-blockers.md](references/merge-blockers.md) · [output.md](references/output.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating a filing or evidence claim. Do not load by habit.

## Entry gate

- **Surface** acquirable — branch, PR, paths, or snapshot ([sources.md](references/sources.md)).
- **Lens** from user wording — not limited to a fixed list.
- Merge-ready full-PR review without a named surface → stop; ask for adapter + scope.

## Non-negotiables

1. **Review only** unless the user explicitly asked to fix — do not edit files or commit during review.
2. **Evidence** — cite `path:line` for every Action item; match evidence bar to surface shape ([review.md](references/review.md)).
3. **Merge-blockers default** — reachable production bugs and security flaws in scope ([merge-blockers.md](references/merge-blockers.md)); cleanliness/style only with improvements lens or explicit user ask.
4. **Prefer no finding over speculation** — each Action claim needs trigger, impact, and counter-evidence checked.

## Workflow

1. **Acquire surface** — [sources.md](references/sources.md): closest adapter + actual scope in header.
2. **Review** — [review.md](references/review.md): trace behavior for the active lens.
3. **File** — [merge-blockers.md](references/merge-blockers.md) + [output.md](references/output.md).

Parallel members → parent uses [`subagents`](../subagents/SKILL.md) [review-council-dispatch.md](../subagents/references/review-council-dispatch.md); each member loads this skill for **how** to review.

## Exit artifact

Per [output.md](references/output.md) — `Review · source:` header, findings, filing class.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
