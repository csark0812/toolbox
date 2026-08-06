---
name: tdd
description: Test-first build at agreed public seams — one red-green slice at a time. Process skill. Not hard-bug loop without seam (diagnose), throwaway spike (prototype), or hunch-only (investigate).
---

# Test-Driven Development

**Source of truth for** test-first implementation at public seams.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — red → green microcycle; tests at public interfaces only. Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `tdd` (MIT © 2026 Matt Pocock).

References: [anti-patterns.md](references/anti-patterns.md) · [output.md](references/output.md) · [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/codebase-design.md).

Read [research-basis.md](references/research-basis.md) only when calibrating seam claims.

## Non-negotiables

1. **Confirm seams** with user before first test — public interfaces only.
2. **Red before green** — one vertical slice per cycle.
3. **Independent expected values** — not tautological to production logic.
4. **Refactor out of scope** — defer to **code-review**.

## Workflow

1. Confirm seams.
2. Failing test → red → minimal green → stop.
3. Report per [output.md](references/output.md).

Unclear seam → **grill** or **investigate** first. After **diagnose**, lock regression here.

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
