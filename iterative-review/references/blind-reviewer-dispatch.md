# Blind reviewer dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Single-member Task recipe for each review pass. Spawn mechanics → [`subagents`](../../subagents/SKILL.md) non-negotiables. Model → `model=inherit-auto` (omit tool `model` under Auto parent).

## When

- **Every** iterative-review review pass — no coordinator-primary substitute.

## Dispatch plan template

```markdown
Task: Iterative review — blind pass · round [N]
Classification: review
Source of truth: slice envelope
Goal: blind-review
Parent model: [Auto | named]
User model overrides: [none]

Members:

- generalPurpose · tier=Standard · model=inherit-auto · stance=blind: memoryless slice review

Synthesis plan: merge member matrix + findings + Cohesion attested-local; coordinator thrash after return
```

## Member prompt template

```
Member 1/1 · review · stance=blind

Sub-task: Review the bounded slice below as if this is the first review. Do not assume prior passes.

Forbidden inputs (must not appear in your reasoning as prior art):
- Prior pass findings or synthesis
- Coordinator thrash notes or theme ledger
- Fix commit messages or fix narrative
- Full user thread / parent chat

Slice envelope:
[paste envelope block from slice-envelope.md]

Materials:
[file excerpts, plan sections — slice only]

Adapter matrix:
[applicable rows from adapters.md — check or N/A each]

Output (required sections):
## Matrix
| Row | Status (checked / N/A + reason) |

## Findings
[Action items with Theme: theme-id when invariant-level; or "No material issues"]

## Cohesion
Cohesion: attested-local | not-attested
[One paragraph: does the slice hold together as one coherent piece this pass?]
```

## Member output rules

- `Cohesion: attested-local` only when matrix complete **and** no material Action findings this pass.
- `Cohesion: not-attested` when Action > 0 or matrix incomplete.
- Member MUST NOT emit `Closure: ready` — coordinator-only ([exit-gate.md](exit-gate.md)).

## Context asymmetry

Align with [`subagents` adversarial context asymmetry](../../subagents/references/adversarial.md): blind member receives slice materials only. Coordinator retains K-round ledger separately ([thrash-ledger.md](thrash-ledger.md)).
