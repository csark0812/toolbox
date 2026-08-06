---
name: handoff
description: Agent-to-agent cross-session transfer — pointers not bodies. Channel prompt (user /handoff) or artifact (model-invoked subagent). Pack and Goal are open vocabulary. Orchestrator for continuing work in a fresh chat. Not same-session continuation without a new chat.
---

# Handoff

**Source of truth for** compact session transfer — **what to rip out**, not full orchestration.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Orchestrator** — cross-session A2A (`channel:prompt` vs `channel:artifact`). Process state lives at pointer paths; this skill compresses thread → next session.

References: [pack.md](references/pack.md) · [output.md](references/output.md) · [handoff-subagent-dispatch.md](references/handoff-subagent-dispatch.md) · [`subagents`](../subagents/SKILL.md).

Read [research-basis.md](references/research-basis.md) only when calibrating claims.

## Non-negotiables

1. **Pointers not bodies** — paths, URLs, SHAs; never paste plans/PRDs/diffs into handoff.
2. **Honest state** — done vs in-progress vs broken; cite commits/tests when claiming progress.
3. **Redact** secrets/tokens/PII before write or paste.
4. **Channel prompt** — user `/handoff` → **no disk** (`_agent/handoffs/` forbidden).
5. **Channel artifact** — model-invoked → subagent write mandatory; coordinator-primary write is a **violation**.

## Workflow

1. **Pick channel + pack + goal** — [pack.md](references/pack.md): closest menu rows; header names reality.
2. **Gather** — minimal bullets from thread; omit empty categories.
3. **Deliver** —
   - `channel:prompt` → fenced block per [output.md](references/output.md)
   - `channel:artifact` → [handoff-subagent-dispatch.md](references/handoff-subagent-dispatch.md) → paste stub only

Fix-loop-only continuation may use consumer overlay blocks instead of `Pack: full` when the next session needs only review state.

## Consumer bindings

Project-specific injected context appended on skill read.
