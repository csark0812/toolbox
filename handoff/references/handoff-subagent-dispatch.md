# Handoff subagent dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Single-member Task recipe for **model-invoked** handoff. Spawn mechanics → [`subagents`](../../subagents/SKILL.md) non-negotiables. Model → `model=inherit-auto` (omit tool `model` under Auto parent).

**Not used** for user-request `/handoff` — that path is prompt-only ([SKILL.md](../SKILL.md) § User-request).

## When

- **Model-invoked handoff** — agent fires handoff due to context pressure or autonomous continuation need.
- **No coordinator-primary substitute** for artifact write.

## Dispatch plan template

```markdown
Task: Handoff — compact session · [timestamp slug]
Classification: handoff
Source of truth: thread summary from coordinator
Goal: write-handoff-artifact
Parent model: [Auto | named]
User model overrides: [none]

Members:

- generalPurpose · tier=Standard · model=inherit-auto · stance=compact: gather, redact, write handoff file

Synthesis plan: confirm path exists; give user paste-ready prompt (do not paste file body)
```

## Member prompt template

```
Member 1/1 · handoff · stance=compact

Sub-task: Compact this session into a handoff file for a fresh chat. Write to disk; return path + paste prompt stub only.

Target workspace (absolute): [path]
Write root: [target]/_agent/handoffs/
Filename: [ISO-date]-[slug].md

Coordinator-supplied thread summary (claims only — verify nothing invented):
[paste coordinator's gathered bullets: ask, decisions, work done, state, blockers, failures, next tries, artifact pointers]

Rules:
- Use the handoff output template from handoff/SKILL.md (every section; paths/URLs only in Artifacts table)
- Redact secrets, tokens, credentials, PII — [REDACTED] before write
- mkdir -p write root; confirm file exists before returning
- Do not commit; do not paste full plan/PRD bodies
- Return: absolute file path, workspace, next-session goal, first suggested action

Forbidden: inventing progress not in coordinator summary
```

## Member output rules

Return:

```markdown
**Handoff path:** `<target>/_agent/handoffs/<filename>.md`
**Workspace:** `<target>`
**Next session goal:** [one line]
**Start with:** [first suggested action]
```

Coordinator ends turn with path confirmation + fenced paste prompt ([SKILL.md § User-request template](../SKILL.md#paste-ready-prompt-user-request)).

## Context asymmetry

Member receives coordinator thread summary — not full parent chat dump when avoidable. Coordinator gathers pointers first to keep member pack bounded.
