---
name: prototype
description: Throwaway artifact answering one design question — logic/state or UI. Process skill (user-invoked). Not production red-green (tdd) or repro-first debug (probe Fix).
disable-model-invocation: true
---

# Prototype

**Source of truth for** throwaway design spikes.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Process skill** — declare question + mode up front. Never silent graduation to production.

References: [LOGIC.md](references/LOGIC.md) · [UI.md](references/UI.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when you calibrate spike claims.

## Entry gate

- **Design question** stated — one falsifiable question, not open-ended build.
- If the user wants production TDD or repro-first debug, stop. Wrong atom for this skill.

## Non-negotiables

1. **Question + mode first** — `throwaway` default unless `keep-skeleton` is justified.
2. **One command to run** — project task runner.
3. **No polish** — no tests, minimal error handling.
4. **Explicit promote/discard** before ending.

## Workflow

1. State question, mode, branch (LOGIC vs UI refs).
2. Build minimal runnable artifact.
3. Report per [output.md](references/output.md). User-facing report uses pragmatic STE.

## Exit artifact

Per [output.md](references/output.md) — question, verdict, promote/discard.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
