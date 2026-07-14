---
name: code-review
description: Multi-lens code review for PR, commit, unstaged, staged, merge, and implementation diffs. Default filing merge-blockers only; say "include improvements" for polish/tests/refactor. Dispatches council via parallel subagents; scannable finding-block output (output.md — not Cursor bugbot subagent). Use when reviewing code, checking a diff, analyzing changes, or the user asks for code review. Auto-detects mode when omitted.
---

# Code review

**Source of truth for** portable council code-review workflow.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

Consumer overlays arrive as project-specific injected context on skill read.

References: [council-dispatch.md](references/council-dispatch.md) · [agent-selection.md](references/agent-selection.md). Ambient routing extract → [agent-routing.md](references/agent-routing.md) § Pre-ship / PR.

## When to Use

- Review PR, commit, staged/unstaged, merge, or implementation diff
- Council dispatch with merge-blocker filing (default)
- Fix-loop / same-session implement after review

Not for: PR description/body authoring (separate skill), Cursor `/review-bugbot` or `/review-security` shortcuts (use this skill for fix-loop and worth-doing gate).

## Quick reference

| Need                            | Reference                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Modes, diff, depth, escalation  | [references/modes.md](references/modes.md)                                                                  |
| Default filing (merge-blockers) | [references/merge-blockers.md](references/merge-blockers.md)                                                |
| Council dispatch + spawn        | [references/council-dispatch.md](references/council-dispatch.md) · [`multi`](../multi/SKILL.md) kernel      |
| Agent selection                 | [references/agent-selection.md](references/agent-selection.md)                                              |
| Review synthesis                | [references/synthesis.md](references/synthesis.md)                                                          |
| Output                          | [references/output.md](references/output.md) — scannable finding-block shape (not Cursor `bugbot` subagent) |
| Fix-loop convergence            | [references/fix-loop-ledger.md](references/fix-loop-ledger.md) — stable themes, invariant matrix, exit gate |

## Workflow

1. **Mode + depth + fix-loop** — explicit or auto-detect mode ([modes.md](references/modes.md)). Apply pr/merge escalation. When prior Action findings exist, reconstruct and carry the stable-theme ledger from [fix-loop-ledger.md](references/fix-loop-ledger.md); derive applicable invariant-matrix rows before dispatch. **Filing mode:** default **merge-blockers only** ([merge-blockers.md](references/merge-blockers.md)) unless user said include improvements / full audit / hardening pass / polish / test inventory / exhaustive triggers. Record depth in synthesis header per [output.md](references/output.md) § Status line.
2. **Diff** — per modes.md (`pr`/`merge` → [shared.md](references/shared.md)).
3. **Council dispatch** — parallel council per [council-dispatch.md](references/council-dispatch.md) ([`multi`](../multi/SKILL.md) kernel for spawn mechanics) → [synthesis.md](references/synthesis.md) → [output.md](references/output.md). **Mandatory before spawn:** append [task-prompt-review.md](references/task-prompt-review.md) § Default filing overlay to **every** member prompt (and coordinator plan). When consumer overlay context was injected on skill read, prefer that overlay set (Filing gate / product-intent / Baseline / Contextual Full) over portable `task-prompt-review.md` thinned sections alone. Missing injected overlay when one is configured = incomplete dispatch.
4. **Chat handoff** — when fix-loop applies: if fix pass, end with the updated ledger, validation evidence, and hotspot list. Re-review must reconcile every candidate to a stable theme and include **Baseline contradictions** when prior synthesis exists.

**Order when fix-loop applies:** council → synthesis → chat findings → handoff if fix pass → end turn.

**Merge gate (human):** Merge-ready / “final blockers” language is allowed only when the [fix-loop exit gate](references/fix-loop-ledger.md#exit-gate) passes. Zero findings alone is insufficient.

**Routing:** PR description / body → separate authoring skill. Review / check / analyze → here.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

**Fix implementation:** User "address all" / "fix all" / "yes" to ship-blockers → read prior synthesis and ledger before coding; implement invariant-complete theme batches; add regression evidence; run the repo’s authoritative validation lane; end with the updated ledger and hotspot handoff.

## Output format

Follow [references/output-schema.md](references/output-schema.md). Review findings use [references/output.md](references/output.md) — scannable finding blocks, synthesis header, Action vs Noted/Deferred tiers per [merge-blockers.md](references/merge-blockers.md).
