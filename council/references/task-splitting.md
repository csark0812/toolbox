# Task splitting (token-efficient)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

How to divide work across members so **total tokens stay under 100k** while independence holds. Model cost → [model-routing.md](model-routing.md).

## Principles

1. **100k hard ceiling per dispatch run** — count coordinator excerpts + every member prompt + attached file excerpts. Over budget → fewer members, smaller slices, pointers not bodies, or a second dispatch run — never exceed 100k.
2. **Minimum viable context per member** — each prompt gets only the sub-task, paths, and materials for its slice. Do not include the full user thread or sibling outputs (except staged debate wave-2 briefs).
3. **No duplicate reads** — if two slices need the same file, one member owns it. Or the coordinator reads once and passes excerpts.
4. **Split on independence boundaries** — source of truth, subsystem, topic, perspective — not arbitrary line counts.
5. **Prefer fewer members** — `N=2` beats `N=5` when the rival cannot do both slices.
6. **Cheapest model for every slice** — Auto / omit `model`. Never pay premium for mechanical gather.

## Split strategies

| Job shape         | Split by                        | Example                                                                |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------- |
| Multi-source      | One member per **source**       | API docs vs repo vs plan file                                          |
| Repo exploration  | **Subsystem** or directory band | `src/auth/` vs `src/billing/`                                          |
| Research          | **Independent topic**           | OAuth spec vs session storage pattern                                  |
| Review / critique | **Perspective** / lens          | Same subject, different stances — not duplicate full bodies per member |

## When **not** to split

- One coherent slice with shared context → single-pass rival (coordinator without council spawn).
- Sequential dependency (B needs A’s output) → staged waves — not same-wave parallel.
- Tiny scope (< ~3 files, one concern) → coordinator pass, no Task.

## Prompt slimming

Each member prompt MUST include:

```markdown
Sub-task: [one sentence — outcome only]
Source: [paths or URLs — minimal list]
Constraints:

- Return only your slice. The coordinator synthesizes.
- Do not assume other members' conclusions.
```

Forbidden in member prompts unless the job requires: full PR description, entire plan, prior pass synthesis, user chat history.

## Token budget checklist (dispatch plan)

Before spawn, record:

- [ ] Each member has a **distinct** sub-task with no overlap
- [ ] Combined path lists have no unnecessary duplication
- [ ] No member receives “review everything” when a path band suffices
- [ ] All members use **cheapest** resolved model ([model-routing.md](model-routing.md))
- [ ] Member count is the **minimum** that preserves independence

## Member count guide

| Scope                   | Typical N              |
| ----------------------- | ---------------------- |
| Focused slice           | 1                      |
| Two independent sources | 2                      |
| Multi-area explore      | 3–4                    |
| Broad research          | 4–6 max                |
| >10                     | Multiple dispatch runs |
