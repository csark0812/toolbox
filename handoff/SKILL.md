---
name: handoff
description: Agent-to-agent cross-session transfer — pointers not bodies. Channel prompt (user /handoff) or artifact (model-invoked subagent). Pack and Goal are open vocabulary. Orchestrator for continuing work in a fresh chat. Not same-session continuation without a new chat.
---

# Handoff

<!-- source-of-truth: compact session transfer — **what to rip out**, not full orchestration. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

**Orchestrator** — cross-session A2A (`channel:prompt` vs `channel:artifact`). Shared vocabulary → [context-pack.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/context-pack.md).

References: [pack.md](references/pack.md) · [output.md](references/output.md) · [handoff-subagent-dispatch.md](references/handoff-subagent-dispatch.md)

When you calibrate claims, read [research-basis.md](references/research-basis.md).

## Entry gate

- **New chat** intended — same-session continuation without transfer is out of scope.
- **Channel** chosen — `prompt` (user) or `artifact` (model-invoked).

## Non-negotiables

1. **Pointers not bodies** — paths, URLs, SHAs. Never paste plans, PRDs, or diffs into handoff.
2. **Honest state** — done vs in-progress vs broken. When you claim progress, cite commits or tests.
3. **Redact** secrets, tokens, and PII before write or paste.
4. **Channel prompt** — user `/handoff` → **no disk** (`_agent/handoffs/` forbidden).
5. **Channel artifact** — model-invoked → subagent write mandatory. Coordinator-primary write is a **violation**.

## Workflow

1. **Pick the channel, pack, and goal** — use the closest rows in [pack.md](references/pack.md). These values control production only.
2. **Gather** — minimal bullets from thread. Omit empty categories.
3. **Deliver** —
   - `channel:prompt` → fenced receiving prompt per [output.md](references/output.md) in pragmatic STE
   - `channel:artifact` → [handoff-subagent-dispatch.md](references/handoff-subagent-dispatch.md) → paste stub only

If the next session needs only review state, use consumer overlay blocks instead of `Pack: full`.

## Consumer bindings

Project-specific injected context is appended on skill read.
