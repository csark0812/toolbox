---
name: prototype
description: Throwaway artifact answering one design question — logic/state or UI. Process skill (user-invoked). Not production red-green (tdd) or repro-first debug (probe Fix).
disable-model-invocation: true
---

# Prototype

**Source of truth for** throwaway design spikes.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — declare question + mode up front; never silent graduation to production.

References: [LOGIC.md](references/LOGIC.md) · [UI.md](references/UI.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating spike claims.

## Entry gate

- **Design question** stated — one falsifiable question, not open-ended build.
- User wants production TDD or repro-first debug → stop; wrong atom for this skill.

## Non-negotiables

1. **Question + mode first** — `throwaway` default unless `keep-skeleton` justified.
2. **One command to run** — project task runner.
3. **No polish** — no tests, minimal error handling.
4. **Explicit promote/discard** before ending.

## Workflow

1. State question, mode, branch (LOGIC vs UI refs).
2. Build minimal runnable artifact.
3. Report per [output.md](references/output.md).

## Exit artifact

Per [output.md](references/output.md) — question, verdict, promote/discard.

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
