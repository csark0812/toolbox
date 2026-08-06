---
name: diagnose
description: Hard-bug discipline — build a tight repro loop, then fix. Process skill; coordinator-only loop. Composes with tdd on the same Slice after repro exists. Not find-only hunch without repro, or greenfield seam-first build.
---

# Diagnose

**Source of truth for** repro-first hard-bug diagnosis.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — shared vocabulary → [context-pack.md](../subagents/references/context-pack.md).

References: [protocol.md](references/protocol.md) · [loop-catalog.md](references/loop-catalog.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating loop claims.

## Entry gate

- **Repro** present or obtainable — failing test, script, CI artifact, or user repro steps.
- Without on-demand failing signal → **stop**; ask for repro. Do not hypothesize root cause.

## Non-negotiables

1. **Loop before cause** — red-capable, deterministic, fast loop named or built before production edits.
2. **Red before fix** — loop proves bug before production edits.

## Workflow

Follow [protocol.md](references/protocol.md) → [output.md](references/output.md).

## Exit artifact

Per [output.md](references/output.md) — loop command, cause citation, fix summary. Lock regression at agreed **Seam** when **tdd** is also active.

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
