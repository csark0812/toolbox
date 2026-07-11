---
name: code-review
description: Multi-lens code review for PR, commit, unstaged, staged, merge, and implementation diffs. Default filing merge-blockers only; say "include improvements" for polish/tests/refactor. Dispatches council via parallel subagents; scannable finding-block output (output.md — not Cursor bugbot subagent). Use when reviewing code, checking a diff, analyzing changes, or the user asks for code review. Auto-detects mode when omitted.
---

# Code review

Council dispatch: [`docs/developer/agent-workflows.md`](../../../docs/developer/agent-workflows.md) § Council agents · [council-dispatch.md](references/council-dispatch.md) · [agent-selection.md](references/agent-selection.md). Ambient routing extract → [agent-routing.md](../references/agent-routing.md) § Pre-ship / PR.

## When to Use

- Review PR, commit, staged/unstaged, merge, or implementation diff
- Council dispatch with merge-blocker filing (default)
- Fix-loop / same-session implement after review

Not for: PR description/body ([`pull-request`](../pull-request/SKILL.md)), Cursor `/review-bugbot` or `/review-security` shortcuts (use this skill for fix-loop and worth-doing gate).

## Quick reference

| Need | Reference |
|---|---|
| Modes, diff, depth, escalation | [references/modes.md](references/modes.md) |
| Default filing (merge-blockers) | [references/merge-blockers.md](references/merge-blockers.md) |
| Council dispatch + spawn | [references/council-dispatch.md](references/council-dispatch.md) · [`multi`](../multi/SKILL.md) kernel |
| Agent selection | [references/agent-selection.md](references/agent-selection.md) |
| Review synthesis | [references/synthesis.md](references/synthesis.md) |
| Output | [references/output.md](references/output.md) — scannable finding-block shape (not Cursor `bugbot` subagent) |
| Thorough/Full gates | [code-review-quality-gates.md](../../../docs/developer/code-review-quality-gates.md) |
| AI drift | [ai-drift.md](../../../docs/developer/ai-drift.md) |
| Large-branch fix-loop | [review-fix-loop.md](../../../docs/developer/review-fix-loop.md) |
| Product intent / non-regressions | [references/product-intent.md](references/product-intent.md) |

## Workflow

1. **Mode + depth + fix-loop** — explicit or auto-detect mode ([modes.md](references/modes.md)). Apply pr/merge escalation. Check [fix-loop eligibility](../../../docs/developer/review-fix-loop.md#eligibility): if prior Action findings in thread/PR → contextual Full re-review; if Full lifecycle eligible → baseline once then contextual Full on subsequent passes. **Filing mode:** default **merge-blockers only** ([merge-blockers.md](references/merge-blockers.md)) unless user said include improvements / full audit / hardening pass / polish / test inventory / exhaustive triggers. Record depth in synthesis header per [output.md](references/output.md) § Status line. **Depth regression:** if Full triggers match but synthesis says Thorough, incomplete turn — escalate to Full or document why triggers did not apply.
2. **Diff** — per modes.md (`pr`/`merge` → [`pull-request` shared.md](../pull-request/references/shared.md)).
3. **Council dispatch** — parallel council per [council-dispatch.md](references/council-dispatch.md) ([`multi`](../multi/SKILL.md) kernel for spawn mechanics) → [synthesis.md](references/synthesis.md) → [output.md](references/output.md). **Mandatory before spawn:** append [task-prompt-review.md](references/task-prompt-review.md) § Default filing overlay to **every** member prompt (and coordinator plan). Missing overlay = incomplete dispatch. When diff removes/relocates user-facing actions, load [product-intent.md](references/product-intent.md) and include overlay in member prompts ([task-prompt-review.md](references/task-prompt-review.md) § Product intent overlay).
4. **Chat handoff** — when fix-loop applies: if fix pass, end with [session handoff](../../../docs/developer/review-fix-loop.md#session-handoff). Re-review must include **Baseline contradictions** when prior synthesis exists.

**Order when fix-loop applies:** council → synthesis → chat findings → handoff if fix pass → end turn.

**Merge gate (human):** Merge when **exit** contextual Full re-review reports **no merge-blockers** (`No merge-blockers in scope`) and no baseline contradictions — not when first Full baseline has findings, and not when total finding count is zero. See [review-fix-loop.md § Merge-ready](../../../docs/developer/review-fix-loop.md#stop--merge-ready).

**Routing:** PR description / body → `pull-request` skill. Review / check / analyze → here.

**Fix implementation:** User "address all" / "fix all" / "yes" to ship-blockers → fix-loop applies: **(1)** read prior chat synthesis or PR comment **before** coding; **(2)** implement theme-complete batches; **(3)** run verify ladder; **(4)** end with session handoff. See [review-fix-loop.md § Fix phase](../../../docs/developer/review-fix-loop.md#fix-phase).

## Output format

Follow [references/output-schema.md](../references/output-schema.md). Review findings use [references/output.md](references/output.md) — scannable finding blocks, synthesis header, Action vs Noted/Deferred tiers per [merge-blockers.md](references/merge-blockers.md).
