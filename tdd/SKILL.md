---
name: tdd
description: Test-first build at agreed public seams — one red-green slice at a time. Process skill. Composes on the same Slice as iterate via layered prompts. Not repro-first hard-bug work without seam, throwaway spike, or find-only hunch settlement.
---

# Test-Driven Development

**Source of truth for** test-first implementation at public seams.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — red → green microcycle; tests at public interfaces only. Shared vocabulary → [context-pack.md](../subagents/references/context-pack.md).

References: [anti-patterns.md](references/anti-patterns.md) · [output.md](references/output.md) · [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/codebase-design.md).

Read [research-basis.md](references/research-basis.md) only when calibrating seam claims.

## Entry gate

- **Seam** agreed with user — public interface under test (`Seam:` header or explicit confirmation).
- **Slice** in scope — path glob or module id shared with other active atoms when layered.
- Without agreed seam → stop and ask; do not write production code or tests at private helpers only.

## Non-negotiables

1. **Red before green** — one vertical slice per cycle.
2. **Independent expected values** — not tautological to production logic.
3. **Refactor out of scope** — defer structural cleanup unless user asks.

## Workflow

1. Confirm **Seam** and **Slice**.
2. Failing test → red → minimal green → stop.
3. Report per [output.md](references/output.md).

When **iterate** is also active on the same **Slice**, run tdd microcycles between blind passes — no skill ordering doc required; user prompt selects both.

## Exit artifact

Per [output.md](references/output.md) — seam, cycle summary, test path citations.

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
