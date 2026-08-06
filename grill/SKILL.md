---
name: grill
description: Shape fuzzy intent and pressure-test a design before code — intent phase then design tree until major branches resolve. Use when the idea is half-formed, assumptions need pressure-testing, or the user says crystallize/grill this. Process skill; dialogue-first. Composes with tdd, iterate, and second-opinion on layered prompts. Not written-artifact-only critique, find-only hunch settlement, or blind slice pass loops.
---

# Grill

**Source of truth for** intent shaping and design-tree alignment before implementation.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — shared vocabulary → [context-pack.md](../subagents/references/context-pack.md). Mid-turn asks → [ask.md](references/ask.md).

References: [ask.md](references/ask.md) · [intent-phase.md](references/intent-phase.md) · [protocol.md](references/protocol.md) · [output.md](references/output.md) · [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md).

Read [research-basis.md](references/research-basis.md) only when calibrating dialogue claims.

## Entry gate

- User wants **dialogue** — fuzzy intent and/or design alignment before implementation (including former “crystallize” asks).
- **Artifact-only critique** of a complete written plan on disk → stop; that mode needs a plan path and perspective dispatch, not Socratic explore here.

## Non-negotiables

1. **Ask via [ask.md](references/ask.md)** — 1–3 same-branch lettered questions in a Context + Questions block; wait for answers.
2. **Facts in repo** — look up; don't ask the user for knowable facts.
3. **Falsifier per node** before leaving a design-tree branch.
4. **No implementation** until alignment or explicit user skip.

## Workflow

Fuzzy or incomplete intent → [intent-phase.md](references/intent-phase.md). Concrete design to pressure-test → [protocol.md](references/protocol.md) → [output.md](references/output.md). Mid-turn user asks always use [ask.md](references/ask.md).

Optional repo facts for a branch → **subagents** parallel-explore; grill stays dialogue-first.

## Exit artifact

Intent exit → [intent-phase.md](references/intent-phase.md) crystallized block. Design-tree exit → [output.md](references/output.md).

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
