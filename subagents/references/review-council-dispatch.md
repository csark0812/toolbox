# Parallel review dispatch (optional)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

When the **parent coordinator** chooses parallel review specialists (user ask or unresolved domain after primary pass). Not part of the [`code-review`](../../code-review/SKILL.md) skill — spawn mechanics live here.

Each member loads [`code-review`](../code-review/SKILL.md) for **how** to review the diff slice assigned.

## Dispatch plan template

```markdown
Task: Code review — parallel · [adapter] · [scope summary]
Classification: review
Source of truth: diff
Goal: review
Parent model: [Auto | named]

Members:

- [subagent_type] · model=inherit-auto · [lens]: [path slice or concern]

Synthesis plan: merge member findings; validate before Action filing; output per code-review/output.md
```

## Member prompt

```
Member N/M · review · [lens]

Sub-task: Review your slice per code-review/SKILL.md (merge-blockers default).

Diff / paths:
[paste slice materials]

Output: finding blocks per code-review/references/output.md
```

## Pre-spawn model-routing gate

[model-routing.md](model-routing.md#pre-spawn-model-routing-gate) — `inherit-auto` means **omit** the Task `model` argument under Auto parent.

## Hard gate

One real Task per planned member before synthesis. Do not fabricate member reports.
