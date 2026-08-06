---
name: grill
description: Pressure-test a design or implementation plan before code — walk the design tree until major branches resolve; repo-first, joint sense-making. Use when there is a concrete design or decision to align on. Not for fuzzy ideation without a design target (crystallize), reviewing a written plan artifact (second-opinion), or bounded slice closure (iterative-review).
---

# Grill

**Source of truth for** design-tree alignment before implementation.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Pressure-test a design before code. Before the first turn, read [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md) (shared behavior).

Read [references/research-basis.md](references/research-basis.md) when calibrating a move or making a research claim. Do not load by habit.

Shared understanding before implementation. **Persist** with patient follow-up until every major branch is resolved — design-tree interview framed as **joint sense-making**, not cross-examination. Cover every branch that matters, including unhappy paths.

## Example opening turn

> I'll walk the design tree with you — one decision at a time until we're aligned. What's the decision or plan you want to pressure-test first?

## Protocol

1. **Persist until alignment** on every aspect that matters for implementation. Don't imply the user should already have all answers.
2. **Walk the design tree** — each choice branches; resolve dependencies before committing to a path.
3. **Facts vs decisions** — if a _fact_ can be found by exploring the environment (repo, tools, docs), look it up rather than asking. _Decisions_ are the user's — put each one to them and wait for the answer.
4. **One decision per turn.** Ask one decision question, then **wait**. Asking multiple questions at once is bewildering. Chained follow-ups on the **same branch** only **after** the user answers. When branches are explicit, prefer **AskQuestion** for that single choice (always include **Other / I'll type it**); mirror/context in prose above the card.
5. **Provisional recommendation** — for every decision question, state your recommended branch and one-line why. Frame it as a default to react to, not the correct answer. Invite pushback; silence is not acceptance.
6. **Consider-the-opposite / falsifier** — after the user engages the recommendation (accepts or chooses another branch), surface what would show that branch was the wrong bet before leaving the node.
7. **Test assumptions with the user** — "If X weren't true, would this still make sense?"
8. **Sharpen domain terms** against the project glossary as they resolve — grill does not own the glossary (no ADR or glossary writes).
9. **Every major branch resolved** — happy path and the branches that matter beside it.
10. **Implement only after alignment** — start code, scaffolding, or [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md) only when **When to stop** criteria are met and the user confirms shared understanding (or explicitly asks to skip grill and build).

## Design tree

At each decision node:

- What are the branches here?
- Which branch are we taking, and why? (Include your provisional recommendation.)
- What does that branch depend on? (Resolve those first.)
- What would show this branch was the wrong bet? (Consider-the-opposite before moving on.)

Repeat until no unresolved branches remain.

## When to stop

- Every significant design choice made explicitly
- Dependencies between decisions resolved in order
- **Falsifier recorded** for every decision node before leaving it — what would show the chosen branch was the wrong bet
- No major "what if X doesn't hold?" questions unanswered _with the user_
- **Silent-topic scan** done — for failure modes, constraints, ownership, rollback, and NFR tradeoffs: each either decided **or** explicitly marked **in scope / out of scope** in the output (no silent skips)
- User can describe the plan without ambiguity (or accepts documented open questions)
- User confirms shared understanding (unless they explicitly skip ahead)

If almost there, **ask the next question** instead of summarizing prematurely.

## Integration

- **planning/build.md** — if the user just finished grill, skip redundant clarification there (Step 4).
- **Repo exploration for a branch** — optional [parallel-explore.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/parallel-explore.md) via **multi** when a design branch depends on repo facts; grill stays dialogue-first.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with this block when **When to stop** criteria are met — not before:

```markdown
## Decisions reached

- [Decision 1]: [What was decided and why]
- [Decision 2]: [What was decided and why]

## Open questions (deferred)

- [Anything explicitly punted]

## Scope notes (silent-topic scan)

- [Topic]: in scope | out of scope — [one line why, if out of scope]

## Next step

- Ready to implement → [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md) (then [code-review](../code-review/SKILL.md) once code exists)
- Terms or structural decisions to persist → [`domain-model`](../domain-model/SKILL.md)
- Written plan for external review → [second-opinion](../second-opinion/SKILL.md) (staged debate)
- Contested premises needing parallel kill-mandate pass (after writing the plan) → **second-opinion**; keep grill dialogue-first otherwise
- One concrete code doubt → [investigate](../investigate/SKILL.md)
- Still fuzzy on intent → **crystallize** skill
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
