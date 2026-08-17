---
name: domain-model
description: Persist glossary entries and ADRs after a term or decision is ready. Process skill. Not open design dialogue.
---

# Domain model

<!-- source-of-truth: persisting glossary terms and ADRs after decisions land. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Process skill** — content is repo-specific. Paths from customize / `AGENTS.md`.

References: [output.md](references/output.md) · [glossary-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/glossary-format.md) · [adr-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/adr-format.md).

Read [research-basis.md](references/research-basis.md) only when you calibrate persistence claims.

## Entry gate

- **Decision** ready — term defined or architectural choice settled.
- If open alternatives are still in play, stop. Ask the user to settle the decision first.

## Non-negotiables

1. **Known paths only** — stop and ask if glossary or ADR location is unknown.
2. **Report only** — no implementation in this pass.

## Workflow

1. Make sure that the target is glossary, ADR, or both.
2. Read existing files. Dedupe or update in place.
3. Write per ambient formats → [output.md](references/output.md). User-facing summary uses pragmatic STE.

## Exit artifact

Per [output.md](references/output.md) — paths written, summary of changes.

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
