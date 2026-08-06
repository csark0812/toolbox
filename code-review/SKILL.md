---
name: code-review
description: How to review a diff — evidence bar, merge-blocker filing, output shape. Use when reviewing code or a diff as primary agent or subagent. Not find-only hunches (investigate), slice cohesion loops (iterate), or plan debate (second-opinion). Spawn orchestration lives in subagents; iterative closure in iterate.
---

# Code review

**Source of truth for** how to read a diff and file review findings — not how to orchestrate multi-agent review loops.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Guidelines for a **review agent or subagent**. Parent coordinator owns spawn, re-review loops, and fix implementation unless the user asked this agent to fix.

References: [review.md](references/review.md) · [sources.md](references/sources.md) · [merge-blockers.md](references/merge-blockers.md) · [output.md](references/output.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating a filing or evidence claim. Do not load by habit.

## Quick reference

| Need             | Reference                                                    |
| ---------------- | ------------------------------------------------------------ |
| Review procedure | [references/review.md](references/review.md)                 |
| Acquire diff     | [references/sources.md](references/sources.md)               |
| Default filing   | [references/merge-blockers.md](references/merge-blockers.md) |
| Output shape     | [references/output.md](references/output.md)                 |

## Non-negotiables

1. **Review only** unless the user explicitly asked to fix — do not edit files or commit during review.
2. **Introduced defects** — file what the diff introduced or newly made reachable; cite `path:line` for every Action item.
3. **Merge-blockers default** — reachable production bugs only ([merge-blockers.md](references/merge-blockers.md)); improvements mode only on explicit user ask.
4. **Prefer no finding over speculation** — each Action claim needs trigger, impact, and counter-evidence checked.

## Workflow

1. **Acquire diff** — [sources.md](references/sources.md): pick adapter, run git commands, read changed files and immediate callers.
2. **Review** — [review.md](references/review.md): trace contracts, guards, error paths, async boundaries, auth, data loss.
3. **File** — [merge-blockers.md](references/merge-blockers.md) + [output.md](references/output.md): finding blocks, optional Noted/Deferred tails.

Parallel specialists or council → parent uses [`subagents`](../subagents/SKILL.md); each review member loads this skill for **how** to review.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
