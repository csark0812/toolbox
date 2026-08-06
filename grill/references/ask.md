# Grill ask block

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Mid-turn ask SSOT when grill needs user judgment. Exit artifacts → [output.md](output.md) or intent-phase exit block — not this file.

Every non-exit turn that waits on the user ends with **Context + Questions only**. No “After you answer” section.

## Template

```markdown
## Context

- **Where:** … (project / area in plain words)
- **Deciding:** … (one plain sentence)
- **Settled:**
  - … (brief full sentences; few bullets; lean)

## Questions

1. **…?**
   Why it matters: … # omit when N=1
   A) … (recommended)
   B) …
   C) … # optional Other: … only if set may be incomplete
   Recommended: A — … # light why (own row)
2. …
   (1–3 total, same branch)
```

## Rules

1. **Self-contained** — other grill chats may be open; everything needed to answer is in Context.
2. **Plain language in questions** — no skill jargon in stems; Context may be precise if needed.
3. **1–3 questions, same branch only** — facets of one thread; new tree node → new turn.
4. **Always this block** when waiting on the user (Context + Questions only).
5. **Closed pick by default** — lettered lists; short free-text only when options cannot be named.
6. **`(recommended)` on option** + separate **`Recommended: <letter> — why`** row.
7. **`Other:`** only when the option set may be incomplete (not on every question).
8. **N=1 slim** — omit “Why it matters”; keep lettered options + recommended mark + Recommended row.
9. **No “After you answer”** section.
10. **Facts repo-first** — do not ask what tools can answer; questions are for user judgment only.

## Worked example — N=1 (slim)

```markdown
## Context

- **Where:** toolbox skills hub — grill ask format
- **Deciding:** Whether mid-turn asks should drop a footer that tells the user what happens next
- **Settled:**
  - Asks already use Where / Deciding / Settled plus lettered picks.
  - The user hops between multiple grill chats, so Context must stand alone.

## Questions

1. **Keep a short “what I’ll do next” footer after the questions?**
   A) No — Context + Questions only (recommended)
   B) Yes — one plain sentence after Questions
   Recommended: A — the next turn can restate Deciding; a footer often repeats noise
```

## Worked example — N=3 (same branch)

```markdown
## Context

- **Where:** Consumer app — session storage for a new auth service
- **Deciding:** How sessions should be stored before implementation starts
- **Settled:**
  - Auth service is new; no production sessions yet.
  - Team wants something simple to operate in the first version.

## Questions

1. **Where should session data live in v1?**
   Why it matters: This choice drives ops load and failure modes.
   A) Redis (recommended)
   B) In-process memory only
   C) Database table
   D) Other: …
   Recommended: A — shared across instances without inventing a new store early

2. **What happens if the store is briefly unreachable?**
   Why it matters: Defines whether users bounce or wait.
   A) Fail closed — treat as logged out (recommended)
   B) Fail open — allow a short grace window
   C) Queue and retry in the request
   Recommended: A — safer default until we have measured outage patterns

3. **How long should a session last before re-auth?**
   Why it matters: Security vs friction for the first release.
   A) 24 hours (recommended)
   B) 7 days
   C) Until browser close only
   Recommended: A — short enough to limit blast radius, long enough for a workday
```
