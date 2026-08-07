# Second-opinion dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

A2A recipe when [**second-opinion**](../../second-opinion/SKILL.md) runs on a written plan (path or paste). Spawn mechanics → [`subagents` SKILL](../SKILL.md). Context pack → [context-pack.md](context-pack.md). Adversarial fields → [adversarial.md](adversarial.md). Cast selection → [plan-review.md](../../second-opinion/references/plan-review.md).

Profile: `plan`. Goal: `adversarial-staged` (full) or `adversarial-light` (light).

Spawn only the members for the **selected cast**. Optional large-artifact pre-gather → [second-opinion-evidence-dispatch.md](second-opinion-evidence-dispatch.md) first (full cast only).

## Wave 1 — attackers (artifact only)

| Stance         | Subagent         | Mandate                                                                                                                                |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `premises`     | `generalPurpose` | Outsider premise / goal / constraint attack — **anchor each kill to plan § or premise id**                                             |
| `completeness` | `generalPurpose` | Axis readiness — [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) overlay |

**Full cast:** both stances in parallel. **Light cast:** exactly one stance.

Under Auto parent: `model=inherit-auto` (omit tool `model`). Diversify via stances only.

## Wave 2 — defender (when selected)

| Stance   | Subagent         | Mandate                                                                                              |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `defend` | `generalPurpose` | Rebut/narrow/concede **anchored** attacker claims. Ignore unanchored unless coordinator tags `drift` |

**Full cast:** always after wave 1. **Light cast:** only if user asked or coordinator judges kills need rebuttal (fleeting default: skip).

Context pack: artifact path or paste title + 2–4 cited primary sources + structured briefs of attacker report(s) (findings/dispositions/anchors only).

## Dispatch plan template — full

```markdown
Task: Second opinion — staged debate for [plan path or title]
Classification: mixed
Source of truth: plan
Goal: adversarial-staged
Cast: full
Parent model: [Auto | named]
User model overrides: [none | member=slug, …]

Wave 1:

- generalPurpose · tier=Standard · model=inherit-auto · stance=premises: outsider premise attack
- generalPurpose · tier=Standard · model=inherit-auto · stance=completeness: axis readiness attack

Wave 2 (after wave 1):

- generalPurpose · tier=Standard · model=inherit-auto · stance=defend: steelman + rebut briefs

Synthesis plan: merge per synthesis gate. Coordinator writes second-opinion/references/output.md shape
```

## Dispatch plan template — light

```markdown
Task: Second opinion — light cast for [plan path or title]
Classification: mixed
Source of truth: plan
Goal: adversarial-light
Cast: light · stance=[premises|completeness] · defend=[yes|no]
Parent model: [Auto | named]
User model overrides: [none | member=slug, …]

Wave 1:

- generalPurpose · tier=Standard · model=inherit-auto · stance=[premises|completeness]: [mandate]

Wave 2 (only if defend=yes):

- generalPurpose · tier=Standard · model=inherit-auto · stance=defend: steelman + rebut brief

Synthesis plan: merge per synthesis gate. Coordinator writes second-opinion/references/output.md shape
```

## Hard gate

Selected cast completed before final report. Do not fabricate missing stances or defender. Synthesis → [second-opinion plan-review.md](../../second-opinion/references/plan-review.md).

## Pre-spawn model-routing gate

[model-routing.md](model-routing.md#pre-spawn-model-routing-gate) — `inherit-auto` means **omit** Task `model` under Auto parent.
