# Grill ask block

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Mid-turn ask SSOT when grill needs user judgment. Exit artifacts → [output.md](output.md) or intent-phase exit block — not this file.

Every non-exit turn that waits on the user ends with **Questions only**. Do not add an “After you answer” section. No `## Context` or **Already agreed:** blocks.

## Template

```markdown
## Questions

### 1. …?

- **A)** … (recommended)
- **B)** …
- **C)** … # optional Other: … only if set can be incomplete

> Why A: … # omit unless the pick is contentious or hard to reverse

---

### 2. …?

… # 1–3 total, same branch. --- between questions when N>1
```

## Rules

1. **Self-contained stems** — other grill chats can be open. Put everything needed to answer in the stem and options. No separate Context preamble.
2. **Human-first prose** — ban skill jargon in stems and options (`thrash`, `Closure`, `soft stop`, `falsifier`, theme ids, and more). Prefer everyday words over labels the skill invented.
3. **No Context block** — do not use `## Context`, **Already agreed:**, or Where / Deciding / Settled keys. Those are retired.
4. **Pragmatic STE for the user** — Questions prose that faces the user must use pragmatic STE. See [docs/skill-evolution.md](../../docs/skill-evolution.md) § Pragmatic STE for toolbox, or `/simple-english`.
5. **1–3 questions, same branch only** — facets of one thread. New tree node → new turn.
6. **Always this block** when waiting on the user (Questions only).
7. **Closed pick by default** — lettered lists. Short free-text only when options cannot be named.
8. **`(recommended)` on option** — mark one pick. Do not add a separate Recommended pick-summary blockquote.
9. **`Other:`** only when the option set can be incomplete (not on every question).
10. **`> Why <letter>:`** — optional. Include only when the pick is contentious or locks a hard-to-reverse seam. Letter matches the recommended option. Line answers why that pick is right, not why the question matters. Omit by default.
11. **No “After you answer”** section.
12. **Facts repo-first** — do not ask what tools can answer. Questions are for user judgment only.
13. **Chat layout (anti-blob)** — never paste stem + options as one paragraph or one unbroken line. Required structure:
    - Each question is `### N. stem` (not bare `1.`)
    - Blank line after the stem, between each option bullet, and before an optional Why line
    - Options are `- **A)** …` bullets (bold letter), never inline `A) … B) …`
    - Optional Why is a `>` blockquote under that question’s options
    - When N>1, `---` between questions

## Worked example — N=1 (slim)

```markdown
## Questions

### 1. For grill mid-turn asks that must stand alone across threads: keep a short “what I will do next” footer after the questions?

- **A)** No — Questions only (recommended)
- **B)** Yes — one STE sentence after Questions
```

## Worked example — N=2 (same branch)

```markdown
## Questions

### 1. For a read-only JSON notes API (session-cookie auth already set): how do clients page a long note list?

- **A)** Cursor tokens (`?cursor=` + `next_cursor`) (recommended)
- **B)** Offset / limit (`?page=` + `page_size`)
- **C)** Return everything in one response up to a hard max

> Why A: stays cheap as the list grows and avoids skip/duplicate pain later

---

### 2. What default page size should that API use?

- **A)** 25 (recommended)
- **B)** 50
- **C)** 100
```

## Worked example — N=3 (same branch)

```markdown
## Questions

### 1. For a new auth service with nothing in production yet: where does session data live in v1?

- **A)** Redis (recommended)
- **B)** In-process memory only
- **C)** Database table
- **D)** Other: …

> Why A: shared across instances without inventing a new store early

---

### 2. If that store is briefly unreachable, what should happen?

- **A)** Fail closed — treat as logged out (recommended)
- **B)** Fail open — allow a short grace window
- **C)** Queue and retry in the request

---

### 3. How long does a session last before re-auth?

- **A)** 24 hours (recommended)
- **B)** 7 days
- **C)** Until browser close only
```
