---
name: domain-model
description: Persist glossary entries and ADRs after a term or decision is ready. Process skill (user-invoked). Not open design dialogue.
disable-model-invocation: true
---

# Domain model

**Source of truth for** persisting glossary terms and ADRs after decisions land.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — content is repo-specific; paths from customize / `AGENTS.md`.

References: [output.md](references/output.md) · [glossary-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/glossary-format.md) · [adr-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/adr-format.md).

Read [research-basis.md](references/research-basis.md) only when calibrating persistence claims.

## Entry gate

- **Decision** ready — term defined or architectural choice settled.
- Open alternatives still in play → stop; ask user to confirm decision first.

## Non-negotiables

1. **Known paths only** — stop and ask if glossary/ADR location unknown.
2. **Report only** — no implementation in this pass.

## Workflow

1. Confirm glossary vs ADR vs both.
2. Read existing files — dedupe/update in place.
3. Write per ambient formats → [output.md](references/output.md).

## Exit artifact

Per [output.md](references/output.md) — paths written, summary of changes.

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
