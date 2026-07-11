---
name: handoff
description: Compact session context for a fresh chat — summarize what was asked, decided, and done; reference artifacts by path only; suggest next skills from agent-routing.md tier table. User-invoked only; not for mid-task routing or authoring plans.
disable-model-invocation: true
---

# Handoff

Compact and transfer context when a long session (grill → plan → implement → review) must continue in a **fresh chat**. Every other skill assumes one continuous context window — this fills that gap.

**Write handoff docs to `_agent/handoffs/` only** — gitignored, inside the workspace so `@`-reference works. Do not create files under `docs/`, `.cursor/plans/`, or anywhere git-tracked.

**Why `_agent/`:** [ai-drift.md](../../../docs/developer/ai-drift.md) § Accumulation flags *session-scoped analysis files* left in tracked source after the issue is resolved. `_agent/` is the repo's ephemeral agent workspace ([memory hub](../../../docs/memory/README.md) — session artifacts; [doc-system.md](../../../docs/developer/doc-system.md) — outside doc perimeter). Handoffs belong there, not in `docs/` or committed paths.

## When to Use

- End of a long session before starting a fresh chat
- Mid fix-loop when context is exhausted but work continues ([review-fix-loop.md § Cross-session handoff](../../../docs/developer/review-fix-loop.md#cross-session-handoff))
- User explicitly asks to "hand off", "compact context", or "prepare for a new session"

Not for: routing between skills mid-task ([`agent-routing.md`](../references/agent-routing.md) · [`dialogue-handoffs.md`](../references/dialogue-handoffs.md)), authoring a plan ([`references/planning/build.md`](../references/planning/build.md)), or review-fix-loop chat blocks only ([review-fix-loop.md § Session handoff](../../../docs/developer/review-fix-loop.md#session-handoff) — use **handoff** when the next session needs full session context, not just fix-loop state).

## Protocol

1. **Confirm scope.** Ask what the next session must pick up (implement, review, investigate, plan revision) if unclear.
2. **Gather from the thread** — original ask, decisions, work done, current state, open questions, blockers. Do not invent progress.
3. **Collect artifact pointers** — paths and URLs only; never paste full bodies into the handoff file:
   - PRDs — cite path strings only; locate via [product hub](../../../docs/product/README.md)
   - Plans under `.cursor/plans/*.plan.md`
   - Linear issue URLs, GitHub PR URLs
   - Git branch name, commit SHAs, and commit messages (one line each)
   - Prior review synthesis pasted in chat (summarize; link PR if on disk)
4. **Redact before write.** Strip secrets, tokens, credentials, and PII from the handoff doc. Use `[REDACTED]` when needed; never write `.env` values or session cookies to disk.
5. **Write to `_agent/handoffs/`.** From repo root:
   - Ensure directory exists: `mkdir -p _agent/handoffs`
   - Create a unique file: `postprint-handoff-YYYYMMDD-HHMMSS.md` (local time) or `mktemp _agent/handoffs/postprint-handoff-XXXXXX.md` when the shell supports it
   - Write the handoff using the [Output template](#output-template) below
   - Do not commit; `_agent/` is in `.gitignore`
6. **Tell the user the path.** End the turn with the **repo-relative path** (and absolute if helpful) so they can `@`-reference it in the next session.

**Suggested skills:** derive from [agent-routing.md](../references/agent-routing.md) — match session state to tier/situation row; list escalate-to skills first, then inline extracts if still Medium.

## Principles

- **Reference, don't duplicate.** Artifacts stay at their paths; the handoff points to them.
- **Actionable for a cold agent.** A reader with no prior thread should know what to do first and which skill to invoke.
- **Honest state.** Distinguish done, in-progress, and deferred; cite evidence (commits, tests run, review themes).
- **No tracked-source pollution.** Never save under `docs/` or other committed paths — use `_agent/handoffs/` ([ai-drift.md § Accumulation](../../../docs/developer/ai-drift.md)).

## Output template

Write this structure to the handoff file (fill every section; use `—` or `none` when empty):

```markdown
# PostPrint session handoff

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

## Artifacts (reference only — do not duplicate)

| Kind | Path or URL |
|------|-------------|
| Plan | `.cursor/plans/….plan.md` |
| PRD | path from [product hub](../../../docs/product/README.md) index |
| Issue | [Linear URL] |
| PR | [GitHub PR URL] |
| Commits | `abc1234` — message |

## Suggested skills (next session)

From [agent-routing.md](../references/agent-routing.md) — tier/situation match; invoke **escalate-to** skills first:

1. **[skill-name]** — [situation row + why]
2. **[skill-name]** — [follow-on]

## Review fix-loop (if applicable)

Closed: [themes]
Open: [themes]
Next batch: [root_cause or —]
Next pass: [e.g. contextual Full re-review — see review-fix-loop.md]

## Redaction note

[What was redacted, or "none"]
```

After writing, tell the user:

```markdown
## Handoff written

**Path:** `_agent/handoffs/postprint-handoff-….md`

Paste or `@`-reference this file in your next session. It is gitignored — do not commit.
```
