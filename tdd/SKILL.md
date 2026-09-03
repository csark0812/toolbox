---
name: tdd
description: Test-first build at agreed public seams, one red-green slice at a time. Process skill. Not repro-first hard-bug work without a seam, a throwaway spike, or find-only hunch settlement.
---

# Test-Driven Development

<!-- source-of-truth: test-first implementation at public seams. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

**Process skill** — red → green microcycle. Tests at public interfaces only. Shared vocabulary → [process-skill-composition.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/process-skill-composition.md).

References: [anti-patterns.md](references/anti-patterns.md) · [output.md](references/output.md) · [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/codebase-design.md).

Read [research-basis.md](references/research-basis.md) only when you calibrate seam claims.

## Entry gate

- **Seam** agreed with the user — public interface under test (`Seam:` header or explicit agreement).
- **Slice** in scope — path glob or module id shared with other active atoms when layered.
- If there is no agreed seam, stop and ask. Do not write production code or tests at private helpers only.

## Non-negotiables

1. **Red before green** — one vertical slice per cycle.
2. **Independent expected values** — not tautological to production logic.
3. **Refactor out of scope** — defer structural cleanup unless the user asks.

## Workflow

1. Make sure that **Seam** and **Slice** are agreed.
2. Failing test → red → minimal green → stop.
3. Report per [output.md](references/output.md). User-facing report uses pragmatic STE.

## Exit artifact

Per [output.md](references/output.md) — seam, cycle summary, test path citations.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/output-schema.md). Details → [references/output.md](references/output.md).
