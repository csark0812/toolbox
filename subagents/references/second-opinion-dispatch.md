# Second-opinion dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

A2A recipe when [**second-opinion**](../../second-opinion/SKILL.md) runs on a written plan. Spawn mechanics → [`subagents` SKILL](../SKILL.md). Context pack → [context-pack.md](context-pack.md). Adversarial fields → [adversarial.md](adversarial.md).

Profile: `plan`. Goal: `adversarial-staged`.

**Always** run wave 1 (both attackers) + wave 2 (defender) — not user-chosen modes. Optional large-artifact pre-gather → [second-opinion-evidence-dispatch.md](second-opinion-evidence-dispatch.md) first.

## Wave 1 — parallel attackers (artifact only)

| Stance         | Subagent         | Mandate                                                                                                                                |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `premises`     | `generalPurpose` | Outsider premise / goal / constraint attack — **anchor each kill to plan § or premise id**                                             |
| `completeness` | `generalPurpose` | Axis readiness — [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) overlay |

Under Auto parent: `model=inherit-auto` (omit tool `model`); diversify via stances only.

## Wave 2 — defender (after both attackers)

| Stance   | Subagent         | Mandate                                                                                              |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `defend` | `generalPurpose` | Rebut/narrow/concede **anchored** attacker claims; ignore unanchored unless coordinator tags `drift` |

Context pack: artifact path + 2–4 cited primary sources + structured briefs of both attacker reports (findings/dispositions/anchors only).

## Dispatch plan template

```markdown
Task: Second opinion — staged debate for [plan path]
Classification: mixed
Source of truth: plan
Goal: adversarial-staged
Parent model: [Auto | named]
User model overrides: [none | member=slug, …]

Wave 1:

- generalPurpose · tier=Standard · model=inherit-auto · stance=premises: outsider premise attack
- generalPurpose · tier=Standard · model=inherit-auto · stance=completeness: axis readiness attack

Wave 2 (after wave 1):

- generalPurpose · tier=Standard · model=inherit-auto · stance=defend: steelman + rebut briefs

Synthesis plan: merge per synthesis gate; coordinator writes second-opinion/references/output.md shape
```

## Hard gate

Both waves completed before final report — do not fabricate debate. Synthesis → [second-opinion plan-review.md](../../second-opinion/references/plan-review.md).

## Pre-spawn model-routing gate

[model-routing.md](model-routing.md#pre-spawn-model-routing-gate) — `inherit-auto` means **omit** Task `model` under Auto parent.
