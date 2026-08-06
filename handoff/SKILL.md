---
name: handoff
description: Session context transfer for a fresh chat — model-invoked subagent writes `_agent/handoffs/` artifact; user `/handoff` gets paste prompt only. Use when context is exhausted mid-session, a long loop must continue elsewhere, or user asks to hand off. Not for fix-loop-only compact (code-review consumer blocks) or same-session continuation without a fresh chat.
---

# Handoff

**Source of truth for** session context transfer into a fresh chat.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Compact and transfer context when a long session (grill → plan → implement → review) must continue in a **fresh chat**. Every other skill assumes one continuous context window — this fills that gap.

Read [references/research-basis.md](references/research-basis.md) when calibrating a move or making a research claim. Do not load by habit.

References: [handoff-subagent-dispatch.md](references/handoff-subagent-dispatch.md) · [research-basis.md](references/research-basis.md) · spawn kernel [`subagents`](../subagents/SKILL.md).

Also owns mid fix-loop compact when context is exhausted but work continues. Consumer fix-loop chat handoff blocks alone are enough when the next session needs only fix-loop state, not full session context. Mid-task work in the same session and plan authoring stay with those skills / [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md).

## Invocation modes

| Mode              | Trigger                                                           | Output                                                                |
| ----------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Model-invoked** | Agent fires handoff (context pressure, autonomous continuation)   | Spawn subagent → write `<target>/_agent/handoffs/` + paste prompt     |
| **User-request**  | User types `/handoff` or explicitly asks to hand off this session | **Paste prompt only** — no artifact file, no `_agent/handoffs/` write |

**Default when the skill auto-fires:** model-invoked subagent path. **Default when the user names handoff:** user-request prompt-only path.

## Model-invoked protocol

When the agent invokes handoff without an explicit user `/handoff`:

1. **Confirm scope.** Ask what the next session must pick up if unclear.
2. **Pick the write root (target workspace).** Relative `@_agent/handoffs/...` resolves against the **next chat's workspace root** — see [Principles](#principles).
3. **Gather from the thread** — original ask, decisions, work done, state, open questions, blockers, **what failed**, **what to try next**, artifact pointers only. Do not invent progress.
4. **Spawn subagent (mandatory).** One Task member per [handoff-subagent-dispatch.md](references/handoff-subagent-dispatch.md). Pass coordinator summary; member redacts, writes file, returns path.
5. **Synthesize.** Confirm file exists; end with [paste-ready prompt](#paste-ready-prompt-user-request) referencing `@_agent/handoffs/<filename>.md`.

**Hard gate:** Model-invoked handoff MUST spawn a real Task subagent before writing the artifact. Coordinator-primary file write is a **violation** — not an optimization.

Entry-skill carve-out applies ([`subagents`](../subagents/SKILL.md) § Entry-skill carve-out).

## User-request protocol (prompt-only)

When the user explicitly invokes handoff (`/handoff`, "hand off this session", "give me a handoff prompt"):

1. **Confirm scope** if unclear.
2. **Pick target workspace** — absolute path the next chat should open (for the paste prompt).
3. **Compact inline** — gather the same facts as the artifact template; redact secrets in the **prompt text**.
4. **Do not write disk** — no `mkdir`, no `_agent/handoffs/` file, no committed doc.
5. **End with paste-ready prompt only** — fenced block per [Paste-ready prompt](#paste-ready-prompt-user-request). Optionally note "prompt-only — no artifact file."

User-request path trades `@`-attach convenience for zero disk side effects.

## Principles

- **Same-root @ attach (model-invoked).** Write the handoff where the next chat will be rooted; relative `@` does not cross workspace roots.
- **Reference, don't duplicate.** Artifacts stay at their paths; handoff cites paths and URLs only.
- **Actionable for a cold agent.** A reader with no prior thread should know what to do first.
- **Honest state.** Distinguish done, in-progress, and deferred; cite evidence (commits, tests run, review themes).
- **Ephemeral path (model-invoked only).** Save under `_agent/handoffs/` only (under the target workspace). `_agent/` should be gitignored.

**Why `_agent/`:** Ephemeral agent workspace — session artifacts outside the doc audit perimeter.

## Artifact template (model-invoked subagent writes this)

Write this structure to the handoff file (fill every section; use `—` or `none` when empty):

```markdown
# Session handoff

**Generated:** [ISO date]
**Workspace:** [absolute path of target workspace root]
**Branch:** [branch name in that workspace, or —]
**Next session goal:** [one line]

## Original ask

[What the user wanted at session start]

## Decisions reached

- [Decision]: [why]

## Work completed

- [What was implemented, reviewed, or validated — with commit SHAs/messages when relevant]

## Current state

[What works, what's broken, what's uncommitted, what's waiting on user]

## Open questions / blockers

- [Item]

## What failed (pointers only)

- [Dead end or rejected approach — path, command, or one-line why it failed]

## What to try next (pointers only)

- [Next probe, test, or branch — not a full plan]

## Artifacts (reference only — do not duplicate)

| Kind    | Path or URL         |
| ------- | ------------------- |
| Plan    | [path]              |
| PRD     | [path]              |
| Issue   | [issue URL]         |
| PR      | [GitHub PR URL]     |
| Commits | `abc1234` — message |

## Suggested next steps (next session)

1. **[action]** — [why, tied to session state]
2. **[follow-on]** — [optional]

## Review fix-loop (if applicable)

Closed: [themes]
Open: [themes]
Next batch: [root_cause or —]
Next pass: [e.g. targeted contextual re-review]

## Redaction note

[What was redacted, or "none"]
```

**Suggested next steps:** infer from session state and installed skill descriptions — what the next session should do first and which workflow fits.

## Paste-ready prompt (user-request)

Use for **user-request** turns and as the **closing fenced block** after model-invoked subagent write. Keep short; do not paste the full handoff body.

### Prompt-only (no artifact)

```text
Open workspace: <absolute target workspace>

Continue this session from the summary below.

Goal: <Next session goal — one line>
Start with: <first suggested action>

---
<paste compact sections: Original ask, Decisions, Work completed, Current state, Open questions, What failed, What to try next, Artifacts as paths/URLs only>
---
```

### With artifact (model-invoked)

Handoff written to `<target>/_agent/handoffs/<filename>.md` (workspace: `<target>`).

Paste into a new agent **rooted in that workspace**:

```text
Open workspace: <absolute target workspace>

Read @_agent/handoffs/<filename>.md and continue from there.

Goal: <Next session goal — one line>
Start with: <first Suggested next steps item>
```

If the next chat cannot be rooted in that workspace, `@`-reference the **absolute** handoff path instead — still do not paste the handoff body.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
