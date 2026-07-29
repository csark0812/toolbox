---
name: tdd
description: Test-driven development — build behavior test-first at agreed seams. Use when the user wants TDD, red-green-refactor, a failing test before implementation, or a regression lock after diagnose. Not for hard-bug loops without a seam (diagnose), throwaway design spikes (prototype), or find-only hunch checks (investigate).
---

# Test-Driven Development

**Source of truth for** test-first implementation at public seams.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `tdd` (MIT © 2026 Matt Pocock).

The **red → green** microcycle: one vertical slice at a time. Tests verify behavior through **public interfaces**, not implementation details. This skill does **not** claim TDD improves velocity or defect rates — it enforces test-first discipline at agreed seams. For design learning without production commitment, use [`prototype`](../prototype/SKILL.md).

Prefer project glossary / `AGENTS.md` for domain vocabulary — no hard `CONTEXT.md` coupling.

Read [references/research-basis.md](references/research-basis.md) when calibrating a move or making a research claim. Do not load by habit.

## Seams — confirm before the first test

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. See [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/codebase-design.md) for deep modules, information hiding, and seam quality.

**Test only at pre-agreed seams.** Before writing any test, name the seams under test and confirm them with the user. No test at an unconfirmed seam.

Ask: "What's the public interface, and which seams should we test?"

## Protocol

1. **Confirm seams** with the user (public interfaces only). Stop if the seam is unclear — narrow with [`grill`](../grill/SKILL.md) or [`investigate`](../investigate/SKILL.md) first.
2. **One vertical slice** — failing test → observe **red** → minimal green → stop. Do not bulk-write tests or implementation.
3. **Independent expected values** — assertions come from spec, worked examples, or known-good literals — not by recomputing the same logic as production code. See [anti-patterns.md](references/anti-patterns.md).
4. **Optional information flow** — where possible, author the failing test without the production change in context (write test from spec/interface only), then implement to green.
5. **Refactoring is out of scope** — defer structural cleanup to [`code-review`](../code-review/SKILL.md), not the red-green loop.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass. No speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Run the test.** Observe red, then green — paste or summarize the invocation and outcome when reporting.

## Anti-patterns

Consult [anti-patterns.md](references/anti-patterns.md) before and during the loop — implementation-coupled, tautological, and horizontal-slicing tests are the common failures.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with:

```markdown
## TDD slice

**Seams:** [confirmed public boundaries]
**Cycle:** red → green (one slice)

### Test

[path/to/test — what behavior it specifies]

### Implementation

[path/to/production — minimal change to green]

### Result

[test command + red/green outcome]

### What to do next

- [next slice, code-review, diagnose, or handoff]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
