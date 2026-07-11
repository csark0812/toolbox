---
name: code-review
description: Multi-lens code review for PR, commit, unstaged, staged, merge, and implementation diffs. Default filing merge-blockers only; say "include improvements" for polish/tests/refactor. Dispatches council via parallel subagents; scannable finding-block output (output.md — not Cursor bugbot subagent). Use when reviewing code, checking a diff, analyzing changes, or the user asks for code review. Auto-detects mode when omitted.
---

# Code review

Council dispatch: consumer agent-workflows and council roster (when present). References: [council-dispatch.md](references/council-dispatch.md) · [agent-selection.md](references/agent-selection.md). Ambient routing extract → [agent-routing.md](references/agent-routing.md) § Pre-ship / PR.

## When to Use

- Review PR, commit, staged/unstaged, merge, or implementation diff
- Council dispatch with merge-blocker filing (default)
- Fix-loop / same-session implement after review

Not for: PR description/body (consumer-local **pull-request** skill), Cursor `/review-bugbot` or `/review-security` shortcuts (use this skill for fix-loop and worth-doing gate).

## Quick reference

| Need | Reference |
|---|---|
| Modes, diff, depth, escalation | [references/modes.md](references/modes.md) |
| Default filing (merge-blockers) | [references/merge-blockers.md](references/merge-blockers.md) |
| Council dispatch + spawn | [references/council-dispatch.md](references/council-dispatch.md) · [`multi`](../multi/SKILL.md) kernel |
| Agent selection | [references/agent-selection.md](references/agent-selection.md) |
| Review synthesis | [references/synthesis.md](references/synthesis.md) |
| Output | [references/output.md](references/output.md) — scannable finding-block shape (not Cursor `bugbot` subagent) |
| Thorough/Full gates | Consumer quality-gates doc (when present) |
| AI drift | Consumer ai-drift doc (when present) |
| Large-branch fix-loop | Consumer review-fix-loop doc (when present) |

## Workflow

1. **Mode + depth + fix-loop** — explicit or auto-detect mode ([modes.md](references/modes.md)). Apply pr/merge escalation. Check fix-loop eligibility via consumer customize. **Filing mode:** default **merge-blockers only** ([merge-blockers.md](references/merge-blockers.md)) unless user said include improvements / full audit / hardening pass / polish / test inventory / exhaustive triggers. Record depth in synthesis header per [output.md](references/output.md) § Status line.
2. **Diff** — per modes.md (`pr`/`merge` → [shared.md](references/shared.md)).
3. **Council dispatch** — parallel council per [council-dispatch.md](references/council-dispatch.md) ([`multi`](../multi/SKILL.md) kernel for spawn mechanics) → [synthesis.md](references/synthesis.md) → [output.md](references/output.md). **Mandatory before spawn:** append [task-prompt-review.md](references/task-prompt-review.md) § Default filing overlay to **every** member prompt (and coordinator plan). Missing overlay = incomplete dispatch.
4. **Chat handoff** — when fix-loop applies: if fix pass, end with session handoff per consumer customize. Re-review must include **Baseline contradictions** when prior synthesis exists.

**Order when fix-loop applies:** council → synthesis → chat findings → handoff if fix pass → end turn.

**Merge gate (human):** Merge when exit contextual Full re-review reports no merge-blockers and no baseline contradictions — per consumer review-fix-loop customize.

**Routing:** PR description / body → consumer-local **pull-request** skill. Review / check / analyze → here.

## Consumer bindings

Project overrides inject via `.skeleton/customize/code-review.md` on skill read. Do not edit synced copies in place.

**Fix implementation:** User "address all" / "fix all" / "yes" to ship-blockers → fix-loop per consumer customize: read prior synthesis before coding; implement theme-complete batches; run verify ladder; end with session handoff.

## Output format

Follow [references/output-schema.md](references/output-schema.md). Review findings use [references/output.md](references/output.md) — scannable finding blocks, synthesis header, Action vs Noted/Deferred tiers per [merge-blockers.md](references/merge-blockers.md).
