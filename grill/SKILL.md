---
name: grill
description: Shape fuzzy intent and pressure-test a design before code — intent phase then design tree until major branches resolve. Use when the idea is half-formed, assumptions need pressure-testing, or the user says crystallize or grill this. Process skill. Dialogue-first. Composes with tdd and second-opinion on layered prompts. Not written-artifact-only critique, find-only hunch settlement, or multi-agent orchestration.
---

# Grill

<!-- source-of-truth: intent shaping and design-tree alignment before implementation. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

**Process skill** — shared vocabulary → [context-pack.md](../council/references/context-pack.md). Mid-turn asks → [ask.md](references/ask.md).

References: [ask.md](references/ask.md) · [intent-phase.md](references/intent-phase.md) · [protocol.md](references/protocol.md) · [output.md](references/output.md) · [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md).

Read [research-basis.md](references/research-basis.md) only when you calibrate dialogue claims.

## Entry gate

- User wants **dialogue** — fuzzy intent and/or design alignment before implementation (including former “crystallize” asks).
- If the ask is **artifact-only critique** of a complete written plan on disk, stop. That mode needs a plan path and perspective dispatch. It is not Socratic explore here.

## Non-negotiables

1. **Ask via [ask.md](references/ask.md)** — 1–3 same-branch lettered questions in a Questions-only block. Wait for answers. Layout: self-contained `### N.` stems and lettered options in pragmatic STE (no Context / Already agreed / Where/Deciding/Settled). Mark `(recommended)` on one pick. Optional `> Why <letter>:` only when the pick is contentious or hard to reverse. Never one blob.
2. **Facts in repo** — look up. Do not ask the user for knowable facts.
3. **Falsifier per node** before you leave a design-tree branch.
4. **No implementation** until alignment or an explicit user skip.

## Workflow

If intent is fuzzy or incomplete → [intent-phase.md](references/intent-phase.md). If the design is concrete and needs a pressure-test → [protocol.md](references/protocol.md) → [output.md](references/output.md). Mid-turn user asks always use [ask.md](references/ask.md).

Optional repo facts for a branch → coordinator tools, or attach **council** for parallel explore. Grill stays dialogue-first.

## Exit artifact

Intent exit → [intent-phase.md](references/intent-phase.md) crystallized block. Design-tree exit → [output.md](references/output.md). User-facing ask and exit blocks use pragmatic STE.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
