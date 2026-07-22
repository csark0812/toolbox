# Adversarial debate (second-opinion)

Staged debate recipe for [`second-opinion`](../SKILL.md). Kernel SSOT → [`multi` adversarial.md](../../multi/references/adversarial.md) § Staged debate. Spawn mechanics → [`multi`](../../multi/SKILL.md) non-negotiables.

Profile: `plan`. Goal: `adversarial-staged`.

Former Stance A (fresh read) and Stance B (completeness) are **Wave-1 member roles** — always both, never user-chosen modes.

## When to use

- Always when **second-opinion** runs on a written artifact

## When to skip

- Dialogue without plan artifact → **crystallize** / **grill**
- Single code-path hunch → **investigate**
- Optional large-artifact gather only → [parallel-plan-evidence.md](parallel-plan-evidence.md) (prep, not a substitute)

## Members

### Wave 1 (parallel, fresh context — artifact only)

| Slice | Subagent | Stance | Mandate |
| ----- | -------- | ------ | ------- |
| Outsider premises | `generalPurpose` | `premises` | Break confidence on implicit goals, constraints, premises |
| Axis readiness | `generalPurpose` | `completeness` | Kill-mandate pass on [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) three axes (scope / gaps / sequencing) |

Under an Auto parent, share `inherit-auto` (omit tool `model`); diversify via stances. Distinct explicit models only under named parent (same tier), user cross-model request, or recorded overrides — [adversarial.md](../../multi/references/adversarial.md) § Model routing overlay.

### Wave 2 (sequential, related context)

| Slice | Subagent | Stance | Mandate |
| ----- | -------- | ------ | ------- |
| Steelman | `generalPurpose` | `defend` | Rebut, narrow, or concede each attacker claim with evidence |

Context pack = artifact + 2–4 cited primary sources (+ optional pre-wave gather) + **structured briefs** of both attacker reports.

## Dispatch plan template

```markdown
Task: Second opinion — staged debate for [plan path]
Classification: mixed
Source of truth: plan
Goal: adversarial-staged
Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]

Wave 1:

- generalPurpose · tier=Standard · model=[inherit-auto | slug] · stance=premises: outsider premise attack
- generalPurpose · tier=Standard · model=[inherit-auto | slug] · stance=completeness: axis readiness attack

Wave 2 (after wave 1):

- generalPurpose · tier=Standard · model=[inherit-auto | slug] · stance=defend: steelman + rebut briefs

Synthesis plan: unified second-opinion.md sections; tag defended/conceded/convergent/divergent
```

## Synthesis

1. Merge per [multi synthesis gate](../../multi/SKILL.md#synthesis-gate) and [adversarial.md](../../multi/references/adversarial.md) § Coordinator synthesis — **preserve conflicts**.
2. **Coordinator** writes final output per [second-opinion.md](second-opinion.md).
3. Hard gate: both waves completed — do not fabricate the debate.

## Handoff

- Gaps found → revise plan, **grill**, or **build**
- Code hunch from cited material → **investigate**
