# Handoff subagent dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Member recipe for **channel:artifact** only. Spawn → [`subagents`](../../subagents/SKILL.md). Output shape → [output.md](output.md). Context pack → [context-pack.md](../../subagents/references/context-pack.md). **Not** user `channel:prompt`.

## Dispatch plan

```markdown
Task: Handoff · channel:artifact · Pack:[pack] · Goal:[slug]
Classification: handoff
Parent model: [Auto | named]

Members:

- generalPurpose · model=inherit-auto · stance=compact: redact, write file, return path stub

Synthesis: paste stub only — never paste artifact body in chat
```

## Member prompt

```
Member 1/1 · handoff · stance=compact

Write handoff artifact per handoff/references/output.md — omit empty sections.

Target workspace: [abs path]
Path: [target]/_agent/handoffs/[filename].md

Coordinator summary (claims only):
[bullets: state, pointers, blockers/failed/next if any]

Rules: redact secrets, mkdir -p, pointers not bodies, no invented progress
Return: path, Goal, Start with
```

## Context asymmetry

Member gets coordinator summary — not full parent chat when avoidable.
