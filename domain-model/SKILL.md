---
name: domain-model
description: Persist glossary entries and ADRs after a term or decision is ready. Process skill (user-invoked). Not open design dialogue (grill, crystallize).
disable-model-invocation: true
---

# Domain model

**Source of truth for** persisting glossary terms and ADRs after decisions land.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — content is repo-specific; paths from customize / `AGENTS.md`. Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `domain-modeling` (MIT © 2026 Matt Pocock).

References: [output.md](references/output.md) · [glossary-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/glossary-format.md) · [adr-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/adr-format.md).

Read [research-basis.md](references/research-basis.md) only when calibrating persistence claims.

## Non-negotiables

1. **No decision, no ADR** — open alternatives → **grill** / **crystallize**.
2. **Known paths only** — stop and ask if glossary/ADR location unknown.
3. **Report only** — no implementation in this pass.

## Workflow

1. Confirm glossary vs ADR vs both.
2. Read existing files — dedupe/update in place.
3. Write per ambient formats → [output.md](references/output.md).

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
