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

---

## Questions

### 1. …?

- **A)** … (recommended)
- **B)** …
- **C)** … # optional Other: … only if set may be incomplete

> **Recommended: A** — … # short summary of the pick
> Why it matters: … # omit this line when N=1

---

### 2. …?

… # 1–3 total, same branch; --- between questions when N>1
```

## Rules

1. **Self-contained** — other grill chats may be open; everything needed to answer is in Context.
2. **Plain language in questions** — no skill jargon in stems; Context may be precise if needed.
3. **1–3 questions, same branch only** — facets of one thread; new tree node → new turn.
4. **Always this block** when waiting on the user (Context + Questions only).
5. **Closed pick by default** — lettered lists; short free-text only when options cannot be named.
6. **`(recommended)` on option** + **Recommended blockquote**: first line `**Recommended: <letter>** — <short pick summary>`; when N>1, next line `Why it matters: …`. No free-standing Why above options.
7. **`Other:`** only when the option set may be incomplete (not on every question).
8. **N=1 slim** — Recommended is one line (pick summary only); omit the Why it matters line.
9. **No “After you answer”** section.
10. **Facts repo-first** — do not ask what tools can answer; questions are for user judgment only.
11. **Chat layout (anti-blob)** — never paste stem + options + Recommended as one paragraph or one unbroken line. Required structure:
    - `---` between Context and Questions
    - Each question is `### N. stem` (not bare `1.`)
    - Blank line after the stem, between each option bullet, and before Recommended
    - Options are `- **A)** …` bullets (bold letter), never inline `A) … B) …`
    - Recommended is a `>` blockquote (pick summary on first line; Why it matters on its own following line when N>1)
    - When N>1, `---` between questions

## Worked example — N=1 (slim)

```markdown
## Context

- **Where:** toolbox skills hub — grill ask format
- **Deciding:** Whether mid-turn asks should drop a footer that tells the user what happens next
- **Settled:**
  - Asks already use Where / Deciding / Settled plus lettered picks.
  - The user hops between multiple grill chats, so Context must stand alone.

---

## Questions

### 1. Keep a short “what I’ll do next” footer after the questions?

- **A)** No — Context + Questions only (recommended)
- **B)** Yes — one plain sentence after Questions

> **Recommended: A** — the next turn can restate Deciding; a footer often repeats noise
```

## Worked example — N=3 (same branch)

```markdown
## Context

- **Where:** Consumer app — session storage for a new auth service
- **Deciding:** How sessions should be stored before implementation starts
- **Settled:**
  - Auth service is new; no production sessions yet.
  - Team wants something simple to operate in the first version.

---

## Questions

### 1. Where should session data live in v1?

- **A)** Redis (recommended)
- **B)** In-process memory only
- **C)** Database table
- **D)** Other: …

> **Recommended: A** — shared across instances without inventing a new store early
> Why it matters: This choice drives ops load and failure modes.

---

### 2. What happens if the store is briefly unreachable?

- **A)** Fail closed — treat as logged out (recommended)
- **B)** Fail open — allow a short grace window
- **C)** Queue and retry in the request

> **Recommended: A** — safer default until we have measured outage patterns
> Why it matters: Defines whether users bounce or wait.

---

### 3. How long should a session last before re-auth?

- **A)** 24 hours (recommended)
- **B)** 7 days
- **C)** Until browser close only

> **Recommended: A** — short enough to limit blast radius, long enough for a workday
> Why it matters: Security vs friction for the first release.
```
