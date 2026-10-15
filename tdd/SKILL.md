---
name: tdd
description: Build a new feature, function or module test-first: write a failing test at its public interface, make it pass, one slice at a time, and fix bugs found in the slice. Use when the user asks to add or build behavior with tests, test-first or TDD. Not repro-first hard-bug work without a seam, a throwaway spike, or find-only hunch settlement.
---

# Test-Driven Development

<!-- source-of-truth: test-first implementation at public seams. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**Process skill** — red → green microcycle. Tests at public interfaces only. Shared vocabulary → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/process-skill-composition.md).

References: [anti-patterns.md](references/anti-patterns.md) · [output.md](references/output.md) · [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/codebase-design.md) · [engineering-principles.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/engineering-principles.md) (test behavior, not implementation; sequence verifiable units).

Read [research-basis.md](references/research-basis.md) only when you calibrate seam claims.

## Entry gate

- **Seam** — the public interface under test. An interface the user names in the request is agreed. Otherwise propose one (`Seam:` header) and get agreement.
- **Slice** in scope — path glob or module id shared with other active atoms when layered.
- If no seam is named or agreed, stop and ask. Do not write production code or tests at private helpers only.

## Non-negotiables

1. **Red before green** — one vertical slice per cycle.
2. **Independent expected values** — not tautological to production logic.
3. **Refactor out of scope** — defer structural cleanup unless the user asks.
4. **Bugs in the slice are in scope.** A bug found in code the slice calls or changes, which would make the requested behavior wrong, gets its own failing test and fix. Never leave a known correctness bug in the slice. Report a bug outside the slice with its location, without fixing it.
5. **Review before done.** When the user asks for review, review the final diff, including changes made after an earlier review, and report what the review found.

## Workflow

1. Make sure that **Seam** and **Slice** are agreed.
2. Failing test → red → minimal green → stop.
3. Report per [output.md](references/output.md). User-facing report uses clear English.

## Exit artifact

Per [output.md](references/output.md) — seam, cycle summary, test path citations.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md). Details → [references/output.md](references/output.md).
