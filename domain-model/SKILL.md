---
name: domain-model
description: Persist glossary entries and ADRs after a term or structural decision is ready to land.
disable-model-invocation: true
---

# Domain model

**Source of truth for** persisting glossary terms and ADRs after decisions are made.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `domain-modeling` (MIT © 2026 Matt Pocock).

**Process is generic; content is always repo-specific.** This skill writes to project-configured paths (glossary file, ADR directory) — never ships product domain terms in the hub.

## Entry gate — no decision, no ADR

**Glossary:** term + definition must be stated (by user or prior grill output). If the term is still fuzzy, route to [`grill`](../grill/SKILL.md) or [`crystallize`](../crystallize/SKILL.md).

**ADR:** a **decision** must be explicit — not a question, not "we should think about X." If alternatives are still open, route to [`grill`](../grill/SKILL.md). Write ADRs only for decided choices.

Also owns handoffs when [`grill`](../grill/SKILL.md) / [`crystallize`](../crystallize/SKILL.md) leave explicit terms or decisions ready to persist.

## Paths

Resolve from customize injection / `AGENTS.md` (soft-default: `docs/glossary.md`, `docs/adr/`). If glossary or ADR path is unknown, **stop and ask** — do not guess Matt-style `CONTEXT.md` paths.

Formats:

- Glossary → [glossary-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/glossary-format.md)
- ADR → [adr-format.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/domain-model/adr-format.md)
- Structural vocabulary → [codebase-design.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/codebase-design.md) when documenting seams or module boundaries

## Protocol

1. **Confirm artifact type** — glossary entry, ADR, or both.
2. **Read existing file(s)** — dedupe; update in place when the term or decision already exists.
3. **Glossary write** — one canonical term per concept; aliases point at canonical; status when useful.
4. **ADR write** — MADR fields; **rejected alternatives required** (at least one); link related glossary terms.
5. **Report** — paths written, what changed; no implementation.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with:

```markdown
## Domain model

**Artifact:** glossary | ADR | both
**Paths:** [repo-relative paths written]

### Summary

[what was added or updated — 1–3 lines]

### What to do next

- [grill if decisions remain open, tdd to implement, code-review, or handoff]
```

## Consumer bindings

Project-specific injected context is appended on skill read. Do not edit synced copies in place.
