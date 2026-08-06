# Investigate dispatch (optional multi-member)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

A2A recipes when [**investigate**](../../investigate/SKILL.md) default single-pass is insufficient. Default investigate stays coordinator-only. Spawn → [`subagents` SKILL](../SKILL.md). Verdict shape → [investigate output.md](../../investigate/references/output.md).

---

## Parallel research

Independent web topics — not a single hunch verdict by itself.

**When:** multiple unrelated library/API/policy questions; user wants parallel research passes.

**Skip:** single topic; answer in repo; code hunch → standard investigate.

```markdown
Task: [research goal]
Classification: research
Source of truth: web
Goal: coverage
Parent model: [Auto | named]

Selected members:

- docs-researcher · tier=Standard · model=inherit-auto · stance=n/a: [topic A]
- docs-researcher · tier=Standard · model=inherit-auto · stance=n/a: [topic B]

Synthesis plan: merge facts + source class; preserve conflicts; back to investigate if one claim remains
```

Fallback: `docs-researcher` unavailable → `generalPurpose`.

---

## Parallel perspective

Contested evidence or explicit stress-test on **one** hunch.

**When:** genuinely mixed evidence or user asks for stress-test.

**Skip:** clear single-target hunch; multi-topic → research section above.

Uses [adversarial.md](adversarial.md) § Parallel kill mandates.

```markdown
Task: Perspective investigate — [one-line hunch]
Classification: mixed
Source of truth: [repo | plan | docs]
Goal: adversarial
Parent model: [Auto | named]

Selected members:

- generalPurpose · tier=Standard · model=inherit-auto · stance=steelman: strongest case for hunch
- generalPurpose · tier=Standard · model=inherit-auto · stance=skeptic: mechanism that refutes

Synthesis plan: preserve conflicts; ACH-lite; verdict per investigate output.md if evidence allows
```

---

## Parallel broad

User explicitly asks to fish broadly across subsystems.

**When:** "fish broadly", "whole subsystem", wiring spans client + backend.

**Skip:** specific file/hook named; plan evidence → [second-opinion-evidence-dispatch.md](second-opinion-evidence-dispatch.md).

```markdown
Task: Broad investigate — [user-stated hunch]
Classification: explore
Source of truth: repo
Goal: coverage
Parent model: [Auto | named]

Selected members:

- explore · tier=Fast · model=inherit-auto · stance=n/a: [area A]
- explore · tier=Fast · model=inherit-auto · stance=n/a: [area B]

Synthesis plan: merge file:line citations; verdict per investigate output.md
```

---

## Pre-spawn model-routing gate

[model-routing.md](model-routing.md#pre-spawn-model-routing-gate). Do not use `*-fast` in parallel. Diversify via prompts/stances, not premium models by default.
