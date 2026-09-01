# Handoff pack & channel

<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

How to **choose what to include** and **how to deliver** it. Compact procedure → [output.md](output.md). Member write rules → [handoff-subagent-dispatch.md](handoff-subagent-dispatch.md).

**Channel** = delivery to the next session. **Pack** = how much context to include. **Goal** = what the next session must do.

Shared member-pack rules → [context-pack.md](https://raw.githubusercontent.com/csark0812/toolbox/main/council/references/context-pack.md).

The menus below are **starting points**, not limits. Pick the closest row. Omit empty sections.

Channel and pack values are producer controls. Do not add them to the receiving prompt or handoff artifact.

## Channel (delivery)

| Channel      | When                                     | Output                                                            |
| ------------ | ---------------------------------------- | ----------------------------------------------------------------- |
| **prompt**   | User `/handoff` or explicit hand-off ask | Fenced paste block only — **no disk**                             |
| **artifact** | Model-invoked (context pressure)         | Subagent writes `<workspace>/_agent/handoffs/` + short paste stub |

Same-root rule: `@_agent/handoffs/...` resolves against the **next chat's workspace**. Write under that root, not the unrelated current root.

## Pack (how much to rip in)

| Pack         | When                                         | Include                                                              |
| ------------ | -------------------------------------------- | -------------------------------------------------------------------- |
| **pointers** | Next session only needs goal + where to look | Goal, Start with, files and links — skip narrative                   |
| **fix-loop** | Review/fix loop continuation only            | Goal, open themes/hotspots, pointers to PR/commits — skip full recap |
| **slice**    | One bounded area                             | Goal, current state, and files or links for that slice               |
| **full**     | Default long session                         | Current state, files and links, and other non-empty sections         |

**Token rule:** pointers not bodies — plans, PRDs, diffs, review synthesis stay at paths/URLs. Redact secrets before write or paste (`[REDACTED]`).

## Goal (next-session lens)

Write `Goal:` as one line in the delivered output. Examples include `implement`, `review`, `probe`, `plan-revise`, and `harden-auth`.

Infer the goal from the session state. If the goal is unclear, ask once.

## Gather (coordinator → member or inline prompt)

From thread, take **claims only** — do not invent progress:

1. Original ask (one line). Fold it into current state for `Pack: pointers`. If `Pack: full` needs more context, expand it.
2. Decisions. If a decision exists, add one bullet.
3. Work done / current state (honest)
4. Pointers (paths, PR, issue, branch, SHAs)
5. Blockers, failed attempts, and next actions. **If a category is empty, omit it.**

For **prompt** channel: compact into fenced block per [output.md](output.md). For **artifact** channel: pass bullets to subagent per [handoff-subagent-dispatch.md](handoff-subagent-dispatch.md).
