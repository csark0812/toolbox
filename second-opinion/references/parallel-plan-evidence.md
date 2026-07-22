# Parallel plan evidence

Optional **pre-wave** evidence gathering for **second-opinion** before staged debate. Uses [`multi`](../../multi/SKILL.md) kernel — [non-negotiables](../../multi/SKILL.md#non-negotiables), [task-prompt.md](../../multi/references/task-prompt.md), [member-schema.md](../../multi/references/member-schema.md).

Profile: `plan`.

Default second-opinion always runs [adversarial-debate.md](adversarial-debate.md). Use this recipe only when the artifact is large and attackers/defender would otherwise lack cited paths — gather **feeds** wave-2 defender context and/or thin path hints in wave-1 packs. **Not** a substitute for debate.

## When to use

- Large plan / PRD / issue set where cited primary sources are many
- User attached **multi** with second-opinion and the artifact needs coverage split first

## When to skip

- Small plan — go straight to [adversarial-debate.md](adversarial-debate.md)
- Dialogue without plan artifact → **crystallize** / **grill**
- Completeness axes alone → still run second-opinion debate (`completeness` attacker loads verify.md); do not use this file as “Stance B”

## Members (coverage split)

| Slice | Focus | Prefer | Fallback |
| ----- | ----- | ------ | -------- |
| Premises + scope | Implicit goals, in/out of scope, acceptance criteria | `generalPurpose` + stance `premises` | Plan text only |
| Dependencies + blast radius | Ordering, hidden deps, structural work | `architecture` if HOST + `contexts` includes `plan`; else `generalPurpose` + stance `blast_radius` | Score on cited paths via [agent-discovery.md](../../multi/references/agent-discovery.md) |
| Cited paths skim | Primary sources named in the plan | `explore` | `generalPurpose` |

## Dispatch plan template

```markdown
Task: Second-opinion — parallel evidence for [plan path]
Classification: gather
Source of truth: plan
Goal: coverage
Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]

Selected members:

- generalPurpose · tier=Standard · model=inherit-auto · stance=premises: premises + scope pass
- architecture · tier=Standard · model=inherit-auto · stance=blast_radius: dependencies + structural gaps (if available)
- explore · tier=Fast · model=inherit-auto · stance=n/a: skim [cited paths]

Synthesis plan: merge member reports into wave-2 defender context / thin path list; then run adversarial-debate.md
```

Under an Auto parent, omit tool `model` (`inherit-auto`).

## Synthesis

1. Merge member [member-schema](../../multi/references/member-schema.md) reports per [multi synthesis gate](../../multi/SKILL.md#synthesis-gate).
2. Feed into [adversarial-debate.md](adversarial-debate.md) Wave 2 (and optional thin path hints for Wave 1) — do **not** skip debate.
3. Final opinion shape → [second-opinion.md](second-opinion.md) after debate.

## Handoff

- Always continue to staged debate.
- Gaps found after debate → user may revise plan or **build**.
