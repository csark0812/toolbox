---
name: handoff
description: Agent-to-agent cross-session transfer — pointers not bodies. Channel prompt (user /handoff) or artifact (model-invoked subagent). Pack and Goal are open vocabulary. Orchestrator for continuing work in a fresh chat. Not same-session continuation without a new chat.
---

# Handoff

<!-- source-of-truth: compact session transfer — **what to rip out**, not full orchestration. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

**Orchestrator** — cross-session A2A (`channel:prompt` vs `channel:artifact`). Shared vocabulary → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/process-skill-composition.md).

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

## Execution interface map

Use this map when the request says "handoff via X client."

1. Pick channel from producer intent:
   - `prompt` for user-directed handoff (`/handoff`)
   - `artifact` for model-invoked context-pressure continuation
2. Build one canonical payload from `pack`, `goal`, and thread claims.
3. Route to the client interface:
   - `prompt`: emit receiving prompt block and hand it to next chat startup.
   - `artifact`: write `<workspace>/_agent/handoffs/<filename>.md`, then emit only the read stub.
4. Validate output with the client-specific rule.

### Cross-client default behavior

| Interface                       | Transport rule            | Producer action                                                                                        | Required receive artifact                       |
| ------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Codex                           | Chat thread controls      | `channel:prompt` for user handoff, `channel:artifact` for model-invoked                                | `channel:prompt` block or handoff artifact path |
| Cursor                          | Conversation continuation | `channel:prompt` into fresh chat unless artifact hook is explicitly available                          | Prompt block                                    |
| Claude Code                     | Chat continuation         | `channel:prompt` into fresh chat; if client-specific task API exists, pass block as first user message | Prompt block                                    |
| Claude API / GPT-like interface | Chat continuation         | `channel:prompt` is required; map fields to a user-visible handoff message                             | Prompt block                                    |
| ChatGPT UI / web chat           | Chat continuation         | `channel:prompt` with `Open workspace` target first line                                               | Prompt block                                    |
| GitHub Copilot Chat             | IDE continuation          | `channel:prompt` only; no shared artifact path unless local host exposes handoff write                 | Prompt block                                    |
| Generic MCP / custom client     | API-specific              | map to canonical payload fields; if no artifact support, downgrade to prompt                           | Prompt block (or artifact path if supported)    |

When an interface does not expose an artifact API, always fall back to `channel:prompt`.

### Codex API branch

Use this when the ask explicitly targets Codex API execution.

1. Build `channel:prompt` payload from plan claims.
2. Prefer one of:
   - start fresh chat with the prompt payload if orchestration is in user flow.
   - use `create_thread` for a new Codex task, then `send_message_to_thread` with the prompt block for handoff bootstrap.
3. For `channel:artifact`, call `handoff` with `channel:artifact` via your orchestration flow, spawn the subagent writer path, then emit only the stub pointing to `<workspace>/_agent/handoffs/<filename>.md`.

Avoid fabricating any unsupported Codex tool calls. If a required API is unavailable, document fallback at `channel:prompt`.

### High-volume interface notes

- For clients with both UI and API modes, document the mode explicitly in your own orchestration.
- If a client has a structured conversation API, preserve the same fields and map only into its initial message payload.
- For IDE-native chat clients, prefer prompt mode with explicit workspace.

### Interface execution boundaries

- Don’t hard-code any one chat stack’s control API as the only supported path.
- Do not include `channel` and `pack` inside receiving content.
- Don’t skip the redaction rule for any interface.
- Don’t write handoff files from the coordinator for `channel:artifact`; spawn/coordinate the subagent path when required.

If the next session needs only review state, use consumer overlay blocks instead of `Pack: full`.

## Consumer bindings

Project-specific injected context is appended on skill read.
