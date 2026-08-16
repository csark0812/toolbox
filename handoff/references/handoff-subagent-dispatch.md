# Handoff subagent dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Member recipe for **channel:artifact** only. Spawn one host **Task** (`generalPurpose`). Output shape → [output.md](output.md). Pack vocabulary → [context-pack.md](../../council/references/context-pack.md) (shared headers only — handoff does not require attaching council). **Not** user `channel:prompt`.

## Dispatch plan

```markdown
Task: Handoff · channel:artifact · Pack:[pack] · Goal:[slug]
Classification: handoff
Parent model: [Auto | named]

Members:

- generalPurpose · model=inherit-auto · stance=compact: redact, write file, return path stub

Synthesis: paste stub only — never paste artifact body in chat
```

Under Auto parent, omit the Task `model` argument (`inherit-auto`).

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
