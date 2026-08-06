---
name: grill
description: Pressure-test a design before code — walk the design tree until major branches resolve. Process skill; dialogue-first. Not fuzzy ideation (crystallize), written plan artifact review (second-opinion), or slice cohesion (iterate).
---

# Grill

**Source of truth for** design-tree alignment before implementation.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — joint sense-making on the design tree, one decision at a time. Optional repo explore → **subagents** (parallel-explore).

References: [protocol.md](references/protocol.md) · [output.md](references/output.md) · [dialogue-contract.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/dialogue-contract.md).

Read [research-basis.md](references/research-basis.md) only when calibrating dialogue claims.

## Non-negotiables

1. **One decision per turn** — wait for the user.
2. **Facts in repo** — look up; don't ask user for knowable facts.
3. **Falsifier per node** before leaving a branch.
4. **No implementation** until alignment or explicit user skip.

## Workflow

Follow [protocol.md](references/protocol.md) → [output.md](references/output.md).

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
