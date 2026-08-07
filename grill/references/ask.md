# Grill ask block

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Mid-turn ask SSOT when grill needs user judgment. Exit artifacts → [output.md](output.md) or intent-phase exit block — not this file.

Every non-exit turn that waits on the user ends with **Context + Questions only**. Do not add an “After you answer” section.

## Template

```markdown
## Context

[1–3 STE sentences: what we are in the middle of — written for a skimming human, not an agent.
No skill jargon. Do not restate the question stem.]

**Already agreed:** # omit this whole block when nothing is locked yet

- …

---

## Questions

### 1. …?

- **A)** … (recommended)
- **B)** …
- **C)** … # optional Other: … only if set can be incomplete

> **Recommended: A** — … # short summary of the pick
> Why it matters: … # omit this line when N=1

---

### 2. …?

… # 1–3 total, same branch. --- between questions when N>1
```

## Rules

1. **Self-contained** — other grill chats can be open. Put everything needed to answer in this ask block (Context + Questions).
2. **Human-first Context** — Context is for the user. After they read it (before the questions), they must know which conversation they are in. Ban skill jargon here (`thrash`, `Closure`, `soft stop`, `falsifier`, theme ids, and more). Say the plain idea instead. Prefer everyday words over labels the skill invented.
3. **Lean Context** — keep the `## Context` heading:
   - Lead with 1–3 STE sentences (required. Never use a bare heading.)
   - Add **Already agreed:** only for locks that change how they pick. Omit the whole block when empty.
   - Do not restate what the `###` stem(s) already ask.
   - Do not use Where / Deciding / Settled keys. Those labels are retired.
4. **Pragmatic STE for the user** — Context prose and Questions prose that face the user must use pragmatic STE. See [docs/skill-evolution.md](../../docs/skill-evolution.md) § Pragmatic STE for toolbox, or `/simple-english`. No skill jargon in stems either.
5. **1–3 questions, same branch only** — facets of one thread. New tree node → new turn.
6. **Always this block** when waiting on the user (Context + Questions only).
7. **Closed pick by default** — lettered lists. Short free-text only when options cannot be named.
8. **`(recommended)` on option** + **Recommended blockquote**: first line `**Recommended: <letter>** — <short pick summary>`. When N>1, next line `Why it matters: …`. No free-standing Why above options.
9. **`Other:`** only when the option set can be incomplete (not on every question).
10. **N=1 slim** — Recommended is one line (pick summary only). Omit the Why it matters line.
11. **No “After you answer”** section.
12. **Facts repo-first** — do not ask what tools can answer. Questions are for user judgment only.
13. **Chat layout (anti-blob)** — never paste stem + options + Recommended as one paragraph or one unbroken line. Required structure:
    - `---` between Context and Questions
    - Each question is `### N. stem` (not bare `1.`)
    - Blank line after the stem, between each option bullet, and before Recommended
    - Options are `- **A)** …` bullets (bold letter), never inline `A) … B) …`
    - Recommended is a `>` blockquote (pick summary on first line. Why it matters on its own following line when N>1.)
    - When N>1, `---` between questions

## Worked example — N=1 (slim)

```markdown
## Context

We are tightening how grill asks look in chat. You often move between several grill threads. Each ask must make sense on its own.

**Already agreed:**

- Questions use lettered picks with a recommended option.
- Each ask must stand alone because you move between grill threads.

---

## Questions

### 1. Keep a short “what I will do next” footer after the questions?

- **A)** No — Context + Questions only (recommended)
- **B)** Yes — one STE sentence after Questions

> **Recommended: A** — the next turn can restate what is already agreed. A footer often repeats noise.
```

## Worked example — N=2 (same branch)

```markdown
## Context

Shipping a small public API for reading project notes. Auth is already decided (session cookie). This turn is only about how clients page through a long note list.

**Already agreed:**

- Responses are JSON.
- v1 is read-only — no create/update endpoints yet.

---

## Questions

### 1. How do clients page through notes?

- **A)** Cursor tokens (`?cursor=` + `next_cursor`) (recommended)
- **B)** Offset / limit (`?page=` + `page_size`)
- **C)** Return everything in one response up to a hard max

> **Recommended: A** — stays cheap when the list grows. Clients skip or duplicate less often.
> Why it matters: This choice locks the response shape and how painful “page 50” gets later.

---

### 2. What is the default page size?

- **A)** 25 (recommended)
- **B)** 50
- **C)** 100

> **Recommended: A** — small enough for mobile. Clients can ask for more when they need it.
> Why it matters: Default size hits every caller who does not opt in.
```

## Worked example — N=3 (same branch)

```markdown
## Context

New auth service — picking how sessions work before any code. Nothing is in production yet. The team wants something simple to run at first.

---

## Questions

### 1. Where does session data live in v1?

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

### 3. How long does a session last before re-auth?

- **A)** 24 hours (recommended)
- **B)** 7 days
- **C)** Until browser close only

> **Recommended: A** — short enough to limit blast radius, long enough for a workday
> Why it matters: Security vs friction for the first release.
```
