---
name: code-review
description: Primary-first code review for any diff source — surface size sets intensity; specialists/council only on escalation. Use when reviewing code or a diff. Not for find-only hunches (probe), PR body authoring, or slice cohesion loops (iterate).
---

# Code review

**Source of truth for** portable primary-first code-review workflow.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-03 -->

Consumer overlays arrive as project-specific injected context on skill read.

References: [review.md](references/review.md) · [sources.md](references/sources.md) · [surfaces.md](references/surfaces.md) · [escalation.md](references/escalation.md).

## Owns

- Diff review across adapters (uncommitted, commit, branch, PR, path-scoped, pasted)
- Merge-blocker filing by default; say "include improvements" for polish/tests/refactor
- Fix-loop re-review and same-session implement-after-review

Cursor `/review-bugbot` and `/review-security` stay those shortcuts.

## Quick reference

| Need                               | Reference                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Procedure (all sources)            | [references/review.md](references/review.md)                                                            |
| Acquire diff (adapters)            | [references/sources.md](references/sources.md)                                                          |
| Surface bands + measurement        | [references/surfaces.md](references/surfaces.md)                                                        |
| Escalation (specialists / council) | [references/escalation.md](references/escalation.md)                                                    |
| Default filing                     | [references/merge-blockers.md](references/merge-blockers.md)                                            |
| Output shape                       | [references/output.md](references/output.md)                                                            |
| Branch/PR base + diff              | [references/shared.md](references/shared.md)                                                            |
| Anti-thrash + re-review            | [references/anti-thrash.md](references/anti-thrash.md)                                                  |
| Fix-loop themes                    | [references/fix-loop-ledger.md](references/fix-loop-ledger.md)                                          |
| Council (escalation only)          | [references/council-dispatch.md](references/council-dispatch.md) · [`subagents`](../subagents/SKILL.md) |
| Research basis (calibration)       | [references/research-basis.md](references/research-basis.md)                                            |

Read research basis when calibrating a move or making a research claim. Do not load by habit.

## Workflow

Follow [review.md](references/review.md) end-to-end:

1. **Source adapter** — [sources.md](references/sources.md): acquire diff + light framing.
2. **Surface band** — [surfaces.md](references/surfaces.md): measure scope; assign Focused / Standard / Broad; log `Surface: …` · `Reviewer: primary`.
3. **Re-review preflight** — bare `review vs main` / tip micro-fix / recoverable themes → [anti-thrash.md](references/anti-thrash.md) **before synthesis and before any Task/council** (hard stop forbids `first-baseline` while triggers fire).
4. **Primary review** — default path: coordinator reads diff and related code; **no Task members** unless [escalation.md](references/escalation.md) applies after the hard stop.
5. **Escalate only when matched** — user asks for lens/council, or primary cannot settle a domain after inspection; then `subagents` + [council-dispatch.md](references/council-dispatch.md) → [synthesis.md](references/synthesis.md). Dispatch plan must carry `Pass class:` + archaeology evidence.
6. **Output** — [output.md](references/output.md): findings-first; Continuity when themes open; Persist reminder when Action > 0; merge-status lines only when merge-readiness is in the ask.

**Filing:** merge-blockers only unless user opted into improvements ([merge-blockers.md](references/merge-blockers.md)).

**Merge gate:** merge-ready language only when [fix-loop exit gate](references/fix-loop-ledger.md#exit-gate) passes.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Findings use [references/output.md](references/output.md).
