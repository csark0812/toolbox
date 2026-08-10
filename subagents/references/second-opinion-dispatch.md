# Second-opinion dispatch

<!-- doc-meta: owner=eng | last-reviewed=2026-08-10 -->

A2A recipe when [**second-opinion**](../../second-opinion/SKILL.md) runs on a written artifact (path or paste). Spawn mechanics → [`subagents` SKILL](../SKILL.md). Context pack → [context-pack.md](context-pack.md). Adversarial fields → [adversarial.md](adversarial.md). Lens invention + depth → [plan-review.md](../../second-opinion/references/plan-review.md).

**Light** = no Task spawns (coordinator-only — no dispatch plan). **Med** and **deep** only below.

Goals: `adversarial-med` | `adversarial-deep`. (Light uses `adversarial-light` in output only — no member spawn.)

Optional large-artifact pre-gather → [second-opinion-evidence-dispatch.md](second-opinion-evidence-dispatch.md) (**deep** only).

## Lens mandates (open vocabulary)

Coordinator invents kebab-case lenses from the ask. Each attacker gets a **one-line kill mandate** in the member prompt. Examples (not a closed set):

| Lens (example) | Mandate                                                                                    | Overlay                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `premises`     | Outsider premise / goal / constraint attack — anchor each kill to artifact § or premise id | —                                                                                                                                                         |
| `completeness` | Axis readiness / gaps — anchor each kill to artifact § or criterion                        | [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) **only** when lens is readiness/gaps-shaped |
| user-named     | Coordinator-written kill mandate from ask wording                                          | —                                                                                                                                                         |

Never load `verify.md` for non-completeness lenses. Never invent filler lenses to match a depth tier.

Under Auto parent: `model=inherit-auto` (omit tool `model`); diversify via mandates only.

## Wave 1 — attackers (artifact only)

| Depth    | Spawn                                                                                                            |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| **Med**  | 1 `generalPurpose` attacker — single combined mandate (fold two thin concerns here; independent mandates → deep) |
| **Deep** | 2–3 `generalPurpose` attackers in parallel — one invented lens each                                              |

## Wave 2 — defender (med/deep default)

| Stance   | Subagent         | Mandate                                                                                              |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `defend` | `generalPurpose` | Rebut/narrow/concede **anchored** attacker claims; ignore unanchored unless coordinator tags `drift` |

**Med/deep:** defender after wave 1 unless user skips. **Deep multi-round:** second attack+defend cycle only if ≥1 ship-blocking kill stays open after defend, or user asks.

Context pack: artifact path or paste title + up to 2–4 cited primary sources when available (else artifact §§ — never invent sources) + structured attacker briefs (findings/dispositions/anchors only).

## Dispatch plan template — med

```markdown
Task: Second opinion — med for [artifact path or title]
Classification: mixed
Source of truth: artifact
Goal: adversarial-med
Depth: med
Lenses: [invented lens slug]
Parent model: [Auto | named]
User model overrides: [none | member=slug, …]

Wave 1:

- generalPurpose · tier=Standard · model=inherit-auto · lens=[slug]: [one-line kill mandate]

Wave 2:

- generalPurpose · tier=Standard · model=inherit-auto · stance=defend: steelman + rebut briefs

Synthesis plan: merge per synthesis gate; coordinator writes second-opinion/references/output.md shape
```

## Dispatch plan template — deep

```markdown
Task: Second opinion — deep for [artifact path or title]
Classification: mixed
Source of truth: artifact
Goal: adversarial-deep
Depth: deep
Lenses: [lens-a, lens-b, lens-c?]
Parent model: [Auto | named]
User model overrides: [none | member=slug, …]

Wave 1:

- generalPurpose · tier=Standard · model=inherit-auto · lens=[lens-a]: [one-line kill mandate]
- generalPurpose · tier=Standard · model=inherit-auto · lens=[lens-b]: [one-line kill mandate]
- [optional third parallel attacker]

Wave 2:

- generalPurpose · tier=Standard · model=inherit-auto · stance=defend: steelman + rebut briefs

Synthesis plan: merge per synthesis gate; coordinator writes second-opinion/references/output.md shape
```

## Hard gate

**Med/deep:** selected depth completed before final report — do not fabricate missing members or defender. **Light:** coordinator-only is correct — do not spawn to satisfy an old “member runs always” rule.

Synthesis → [second-opinion plan-review.md](../../second-opinion/references/plan-review.md).

## Pre-spawn model-routing gate

[model-routing.md](model-routing.md#pre-spawn-model-routing-gate) — `inherit-auto` means **omit** Task `model` under Auto parent.
