---
name: handoff
description: Compact session context into `_agent/handoffs/` for a fresh chat — paths only, no artifact paste.
disable-model-invocation: true
---

# Handoff

**Source of truth for** session context transfer into a fresh chat.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-02 -->

Compact and transfer context when a long session (grill → plan → implement → review) must continue in a **fresh chat**. Every other skill assumes one continuous context window — this fills that gap.

**Write handoff docs to `_agent/handoffs/` only** — gitignored, inside the workspace so `@`-reference works. Do not create files under committed doc trees or plan locations.

**Why `_agent/`:** Ephemeral agent workspace — session artifacts outside the doc audit perimeter.

Also owns mid fix-loop compact when context is exhausted but work continues. Consumer fix-loop chat handoff blocks alone are enough when the next session needs only fix-loop state, not full session context. Mid-task work in the same session and plan authoring stay with those skills / [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating a move or making a research claim. Do not load by habit.

## Protocol

1. **Confirm scope.** Ask what the next session must pick up (implement, review, investigate, plan revision) if unclear.
2. **Gather from the thread** — original ask, decisions, work done, current state, open questions, blockers, **what failed** (dead ends, rejected approaches), and **what to try next** (pointers only). Do not invent progress.
3. **Collect artifact pointers** — paths and URLs only; never paste full bodies into the handoff file:
   - PRDs — cite path strings only
   - Plans on disk — cite path strings only
   - Issue URLs, GitHub PR URLs
   - Git branch name, commit SHAs, and commit messages (one line each)
   - Prior review synthesis pasted in chat (summarize; link PR if on disk)
4. **Redact before write.** Strip secrets, tokens, credentials, and PII from the handoff doc. Use `[REDACTED]` when needed; never write `.env` values or session cookies to disk.
5. **Write to `_agent/handoffs/`.** From repo root:
   - Ensure directory exists: `mkdir -p _agent/handoffs`
   - Create a unique timestamped file
   - Write the handoff using the [Output template](#output-template) below
   - Do not commit; `_agent/` should be in `.gitignore`
6. **Give a paste-ready new-agent prompt.** End the turn with the repo-relative path **and** a fenced prompt the user can paste into a fresh chat. The prompt must `@`-reference the handoff file (so the client attaches it) and state the next-session goal plus the first suggested action. Do not paste the handoff body into the prompt.

**Suggested next steps:** infer from session state and installed skill descriptions — what the next session should do first and which workflow fits (implement, review, investigate, plan revision, etc.).

## Principles

- **Reference, don't duplicate.** Artifacts stay at their paths; the handoff points to them.
- **Actionable for a cold agent.** A reader with no prior thread should know what to do first.
- **Honest state.** Distinguish done, in-progress, and deferred; cite evidence (commits, tests run, review themes).
- **Ephemeral path.** Save under `_agent/handoffs/` only.

## Output template

Write this structure to the handoff file (fill every section; use `—` or `none` when empty):

```markdown
# Session handoff

**Generated:** [ISO date]
**Branch:** [branch name or —]
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

After writing, tell the user the path, then a **paste-ready prompt** in a fenced code block (fill placeholders from the handoff; keep it short):

Handoff written to `_agent/handoffs/<filename>.md`.

Paste into a new agent:

```text
Read @_agent/handoffs/<filename>.md and continue from there.

Goal: <Next session goal — one line>
Start with: <first Suggested next steps item>
```

If `@` attach is unavailable in that client, say to open or attach the same path — still do not paste the handoff body.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
