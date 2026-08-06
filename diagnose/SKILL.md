---
name: diagnose
description: Hard-bug discipline — build a tight repro loop, then fix and lock regression. Process skill; coordinator-only loop. Not find-only hunch without repro (verdict.md + explore) or greenfield TDD (tdd).
---

# Diagnose

**Source of truth for** repro-first hard-bug diagnosis.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — loop before hypotheses. Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `diagnosing-bugs` (MIT © 2026 Matt Pocock).

References: [protocol.md](references/protocol.md) · [loop-catalog.md](references/loop-catalog.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating loop claims.

## Non-negotiables

1. **No loop, no hypotheses** — failing signal required.
2. **Red before fix** — loop proves bug before production edits.
3. **Lock regression** — hand to **tdd** at agreed seam.

## Workflow

Follow [protocol.md](references/protocol.md) → [output.md](references/output.md).

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
