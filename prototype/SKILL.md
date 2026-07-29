---
name: prototype
description: Throwaway artifact to answer one design question — logic/state model or UI look-and-feel. Use when the user wants to prototype, sanity-check a state model, or explore UI options before real build. Not for production test-first work (tdd) or hard-bug diagnosis (diagnose).
disable-model-invocation: true
---

# Prototype

**Source of truth for** throwaway artifacts that answer one design question.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `prototype` (MIT © 2026 Matt Pocock).

A prototype is **throwaway code that answers a question**. Declare the question and mode up front; never silently graduate throwaway to production.

**Not for:** production test-first build ([`tdd`](../tdd/SKILL.md)), hard-bug loops ([`diagnose`](../diagnose/SKILL.md)), or design-tree alignment without code ([`grill`](../grill/SKILL.md)).

## When to Use

- User wants to prototype, spike, or sanity-check whether logic/state or UI feels right
- [`grill`](../grill/SKILL.md) surfaced an open question that needs a runnable answer
- One design question — not a production feature slice

Not for: agreed production seams ([`tdd`](../tdd/SKILL.md)), reproducible bugs ([`diagnose`](../diagnose/SKILL.md)), written plan review ([`second-opinion`](../second-opinion/SKILL.md)).

## Up front — question + mode

Before writing code, state:

1. **Design question** — one sentence, falsifiable ("Does this state model handle X?", "Which layout reads clearest?")
2. **Mode** — `throwaway` (default) or `keep-skeleton` (walking skeleton / tracer bullet — rare; say why)
3. **Branch** — logic/state vs UI (see below)

If ambiguous and the user is reachable, ask. If not, default from context (backend module → logic; page/component → UI) and state the assumption.

| Question type                             | Branch | Reference                       |
| ----------------------------------------- | ------ | ------------------------------- |
| Does this logic / state model feel right? | LOGIC  | [LOGIC.md](references/LOGIC.md) |
| What should this look like?               | UI     | [UI.md](references/UI.md)       |

## Rules (both branches)

1. **Mark throwaway clearly** — name/path shows prototype, not production.
2. **One command to run** — use the project's task runner; user starts without thinking.
3. **No persistence by default** — state in memory unless persistence _is_ the question.
4. **Skip polish** — no tests, minimal error handling, no abstractions beyond runnable.
5. **Surface state** — after every action, print or render full relevant state.

## Promote / discard gate

Before ending, explicit verdict:

- **Discard** — question answered; delete or leave on throwaway branch; capture verdict in issue/handoff.
- **Promote** — only when mode was `keep-skeleton` or user explicitly promotes; never silent graduation from throwaway.
- **More grill** — open questions remain → [`grill`](../grill/SKILL.md).
- **Real build** — validated decision → [`tdd`](../tdd/SKILL.md) or project build docs.

Cross sessions → [`handoff`](../handoff/SKILL.md) with verdict + pointer.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with:

```markdown
## Prototype

**Question:** [one line]
**Mode:** throwaway | keep-skeleton
**Branch:** logic | UI
**Run:** `[one command]`

### Verdict

[what we learned — promote / discard / more grill]

### What to do next

- [grill, tdd, handoff, or discard cleanup]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
