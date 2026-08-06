# Parallel review dispatch (optional)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

When the **parent coordinator** chooses parallel review specialists (user ask or unresolved domain after primary pass). Not part of the [`code-review`](../../code-review/SKILL.md) skill — spawn mechanics live here.

Each member loads [`code-review`](../../code-review/SKILL.md) for **how** to review the surface slice assigned.

Member context → [context-pack.md](context-pack.md) · surface/lens → [code-review/sources.md](../../code-review/references/sources.md).

## Dispatch plan template

```markdown
Task: Code review — parallel · [adapter] · [scope summary]
Classification: review
Source of truth: review surface (diff, paths, or snapshot)
Goal: review
Parent model: [Auto | named]

Members:

- [subagent_type] · model=inherit-auto · [lens]: [path slice or concern]

Synthesis plan: merge member findings; validate before Action filing; output per code-review/output.md
```

## Member prompt

```
Member N/M · review · Lens:[lens]

Sub-task: Review your slice per code-review/SKILL.md (merge-blockers default).

Context pack:
- Surface: [adapter from sources.md]
- Lens: [lens slug]
- Source: [path list or diff stat — read in scope via repo tools; no full diff paste]

Output: finding blocks per code-review/references/output.md
```

## Pre-spawn model-routing gate

[model-routing.md](model-routing.md#pre-spawn-model-routing-gate) — `inherit-auto` means **omit** the Task `model` argument under Auto parent.

## Hard gate

One real Task per planned member before synthesis. Do not fabricate member reports.
