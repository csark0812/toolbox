# Adversarial dispatch

**Source of truth for** adversarial parallel and staged-debate recipes on the [`multi`](../SKILL.md) kernel.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-22 -->

Spawn mechanics, Auto-first model routing, and synthesis gate → [`multi` SKILL](../SKILL.md). Member shape → [member-schema.md](member-schema.md). Entry skills own domain overlays and final report shape.

## Shapes

| Shape | Waves | Who | Default entry |
| ----- | ----- | --- | ------------- |
| **Parallel** | One | Independent kill-mandate members | `code-review` (always); `investigate` when contested / stress-test |
| **Staged debate** | Two | Wave 1 attackers → Wave 2 defender (sees wave-1 briefs) | `second-opinion` (always) |

**Hard rule (same wave):** Members do not communicate. Never identical model + identical prompt.

**Staged exception:** Wave 2 may receive **coordinator-composed briefs** of wave-1 findings only — not live inter-member chat. That is the intentional back-and-forth.

## Non-negotiables

1. **Real Task spawns** — one host Task/Subagent per planned member per wave ([multi non-negotiables](../SKILL.md#non-negotiables)).
2. **Context asymmetry** — member prompts exclude parent-chat reasoning, builder justifications, and other members' raw transcripts (except wave-2 briefs, structured by the coordinator).
3. **Kill mandates** — do not ask for generic “critique.” Mandate breaking confidence or killing weak claims.
4. **One cycle** — one parallel round or one debate cycle (wave1→wave2→synth) unless the user asks for another.
5. **Empirical preference** — when a claim is falsifiable in-repo, prefer primary evidence / tests over model agreement.

## Context pack

```markdown
Artifact:
[diff | plan path | hunch target — the subject only]

Requirements / acceptance (if any):
[stated criteria — or "none"]

Constraints:
- Do not assume other members' conclusions.
- Do not invent parent-chat conclusions.
- Return only your mandate; coordinator synthesizes.

Output: [member-schema.md](member-schema.md) plus adversarial fields below.
```

Ban phrases like “prior chat concluded…” or dumping the coordinator's synthesis into wave-1 prompts.

## Adversarial member fields

Append to [member-schema.md](member-schema.md):

```markdown
## Disposition

promote | kill | concede

## Kill rationale

[Why this claim should ship-block, be dropped, or be narrowed — or "n/a"]

## Evidence

[Primary refs: file:line, plan section, test, or "none"]
```

## Model routing overlay

Follow [multi Model assignment](../SKILL.md#model-assignment) and [model-routing.md](model-routing.md).

| Situation | Member `model` |
| --------- | -------------- |
| Auto parent, no user override | `inherit-auto` (omit tool `model`) — **default** |
| Named parent, no cross-model request | Prefer `auto` when in enum; else cheapest good enough same tier |
| User says cross-model / different models, **or** named parent + diversity wanted | Distinct **same-tier** family slugs from host enum across attackers — **never** escalate tier or use `*-fast` just to diversify |
| User names a member model | That slug if in enum |

Shared Auto across adversarial members is correct and still valuable (fresh context + kill mandates).

## A. Parallel adversarial

### When / skip

- **Always** for `code-review` council (entry skill applies kill-mandate overlays on depth-budgeted lenses).
- `investigate` when evidence is contested or the user asks for a stress-test.
- Skip for routine coverage gather/explore unless an entry skill invokes it.

### Members

Same material, independent mandates. Entry skill picks budget and stance ids.

Typical pair when not using domain lenses:

| Stance | Mandate |
| ------ | ------- |
| `attacker` | Strongest reasons to reject / confirm risk |
| `refuter` | Kill weak or false findings; mechanisms that prevent the risk |

Code-review: keep lens selection; every member gets a kill mandate for their lens; budget ≥ 2 reserves one `refuter` slot (prefer dropping lowest-scored **optional** lens, never a required agent). Quick (1) = single lens with attacker mandate only.

### Synthesis

1. Merge agreements; state once at highest shared confidence.
2. Tag each claim `convergent` (2+ independent members) vs `divergent` (1).
3. Preserve conflicts — do not flatten.
4. Divergent high-severity claims need stronger primary evidence or demotion (entry skill filing rules).
5. Do not treat unanimous same-family agreement as proof.
6. High-stakes Action contradictions → multi tiebreaker or user.

## B. Staged debate

### When / skip

- **Always** for `second-opinion` on a written artifact.
- Elsewhere only when an entry skill cites this shape.
- Not a substitute for dialogue (`crystallize` / `grill`).

### Wave 1 — parallel attackers (fresh context)

Spawn **two** members. Context pack = **artifact only**.

| Stance | Mandate |
| ------ | ------- |
| `premises` | Break confidence on implicit goals, constraints, premises, outsider “why this at all?” |
| `completeness` | Break confidence on readiness using the three-axis checklist from [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) as an **overlay** (scope / gaps / sequencing) — kill mandate, not a polite checklist |

Do not collapse to one attacker when the user emphasizes only “did I miss anything” or only “outsider read.”

### Wave 2 — defender (related context)

After both attackers return, spawn **one** member:

| Stance | Mandate |
| ------ | ------- |
| `defend` | Steelman the original; rebut, narrow, or concede each attacker claim with evidence |

Context pack = artifact + 2–4 primary sources the plan cites (or coordinator-gathered related context) + **structured briefs** of both attacker reports (findings / dispositions only — not coordinator synthesis).

### Coordinator synthesis

1. One unified report (entry skill shape): critique **and** axis/readiness gaps together.
2. Tag claims `attacker-convergent` / `attacker-divergent` / `defended` / `conceded`.
3. Preserve unresolved conflict.
4. Premise-confirm with the user when premises are unsettled before treating the opinion as final.
5. Hard gate: both waves completed before the final report — do not fabricate debate outcomes.

### Dispatch plan sketch

```markdown
Task: Second opinion — staged debate for [artifact]
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

Synthesis plan: unified second-opinion report; tag defended/conceded/convergent/divergent
```

## Optional pre-wave gather

Large artifacts may run coverage gather first ([parallel-plan-evidence](../../second-opinion/references/parallel-plan-evidence.md) or similar). Gather feeds wave-2 defender context and/or thin path hints — **not** a substitute for debate.
