---
name: second-opinion
description: Multiple independent perspectives on a written plan — premise stress, completeness axes, then defense with primary sources. Process skill; member runs → subagents second-opinion-dispatch. Not dialogue without a plan (grill), slice cohesion (iterate), or a single hunch (verdict.md + explore).
---

# Second opinion

**Source of truth for** what plan review perspectives mean and how to synthesize them.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — written artifact on disk; parallel outsider + completeness perspectives, then defender with cited sources. **A2A wiring** → [`subagents`](../subagents/SKILL.md) [second-opinion-dispatch.md](../subagents/references/second-opinion-dispatch.md).

References: [plan-review.md](references/plan-review.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating debate claims.

## Non-negotiables

1. **Artifact on disk** — plan, PRD, or issue set; not Socratic explore.
2. **Both wave-1 perspectives** — `premises` + `completeness`; never ask user to pick one.
3. **Claim anchoring** — kills map to plan § or premise id; unanchored → `drift`.
4. **Both waves before final report** — coordinator-only critique without member runs is a **violation** ([dispatch](../subagents/references/second-opinion-dispatch.md)).

## Workflow

1. **Locate artifact** — path on disk.
2. **Premise surface** — [plan-review.md](references/plan-review.md): 3–6 premises; confirm with user if unsettled.
3. **Run perspectives** — **subagents** [second-opinion-dispatch.md](../subagents/references/second-opinion-dispatch.md); large plans → optional [second-opinion-evidence-dispatch.md](../subagents/references/second-opinion-evidence-dispatch.md).
4. **Synthesize** — [plan-review.md](references/plan-review.md) + [output.md](references/output.md).

Wave 1: artifact only. Wave 2: artifact + 2–4 cited primary sources + attacker briefs — do not ask user for paths already in the plan.

## Consumer bindings

Plan artifact paths arrive as injected context on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
