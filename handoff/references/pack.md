# Handoff pack & channel

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

How to **choose what to include** and **how to deliver** it. Compact procedure → [output.md](output.md). Member write rules → [handoff-subagent-dispatch.md](handoff-subagent-dispatch.md).

**Channel** = delivery to the next session. **Pack** = how much context to include. **Goal** = what the next session must do — kebab-case slug, open vocabulary.

Shared member-pack rules → [`subagents` context-pack.md](../../subagents/references/context-pack.md).

Menus below are **starting points**, not limits. Pick closest row, name reality in the header, omit empty sections.

## Channel (delivery)

| Channel      | When                                     | Output                                                            |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| **prompt**   | User `/handoff` or explicit hand-off ask | Fenced paste block only — **no disk**                             |
| **artifact** | Model-invoked (context pressure)         | Subagent writes `<workspace>/_agent/handoffs/` + short paste stub |

Same-root rule: `@_agent/handoffs/...` resolves against the **next chat's workspace**. Write under that root, not the unrelated current root.

## Pack (how much to rip in)

| Pack         | When                                         | Include                                                              |
| ------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| **pointers** | Next session only needs goal + where to look | Goal, Start with, Pointers table — skip narrative                    |
| **fix-loop** | Review/fix loop continuation only            | Goal, open themes/hotspots, pointers to PR/commits — skip full recap |
| **slice**    | One bounded area                             | Goal, state for that slice, pointers scoped to slice paths           |
| **full**     | Default long session                         | State, pointers, blockers/failed/next **only if non-empty**          |

**Token rule:** pointers not bodies — plans, PRDs, diffs, review synthesis stay at paths/URLs. Redact secrets before write or paste (`[REDACTED]`).

## Goal (next-session lens)

Header `Goal:` — one line. Examples: `implement`, `review`, `probe` (hunch or repro-first bug), `plan-revise`, `iterate-slice`, or user phrase as slug (`harden-auth`).

Infer from session state. Ask once if unclear.

## Gather (coordinator → member or inline prompt)

From thread, take **claims only** — do not invent progress:

1. Original ask (one line) — fold into State for `Pack: pointers`. Expand for `full` only if needed
2. Decisions — bullet if any
3. Work done / current state (honest)
4. Pointers (paths, PR, issue, branch, SHAs)
5. Blockers / failed / next try — **omit category if empty**

For **prompt** channel: compact into fenced block per [output.md](output.md). For **artifact** channel: pass bullets to subagent per [handoff-subagent-dispatch.md](handoff-subagent-dispatch.md).
