---
name: second-opinion
description: Multiple independent perspectives on a written plan, PRD, or issue set — premise stress, completeness axes, then defense with primary sources. Process skill; staged member runs → subagents. Not dialogue without a plan (crystallize, grill), slice cohesion loop (iterate), or a single hunch (investigate).
---

# Second opinion

**Source of truth for** written plan review — what perspectives to apply and how to synthesize them.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — natural-language arc: outsider premise stress and completeness axes in parallel, then a defender with cited primary sources. **A2A wiring** → [`subagents`](../subagents/SKILL.md) ([adversarial-debate.md](references/adversarial-debate.md) + [adversarial.md](../subagents/references/adversarial.md) § Staged debate; dispatch refs pending consolidation).

Follow [references/second-opinion.md](references/second-opinion.md). Not a Socratic explore session — artifact must be on disk.

Read [references/research-basis.md](references/research-basis.md) when calibrating a move or making a research claim. Do not load by habit.

**No Stance A/B.** Outsider premise critique and completeness/axis readiness always run **in tandem** as Wave-1 subagent roles. Do not ask “fresh read or verify?”

## Owns

- Written plan on disk (including `.cursor/plans/*.plan.md`), PRD, or issue set — freshness or completeness pass
- Protocol + output sections → [references/second-opinion.md](references/second-opinion.md)

Routes elsewhere: dialogue without a plan → **crystallize** / **grill**; new plan from intent → **crystallize** / **grill** → [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md); single code-path hunch → **investigate**.

## Stance and repo

- **Primary-source-first for the defender wave:** Wave 2 receives 2–4 primary sources the plan cites — code files, docs, data, or prior decisions; do not ask the user for paths that appear in the plan. Wave 1 attackers get the **artifact only** (context asymmetry).
- Structural “worth deepening?” → brief notes in synthesis per [second-opinion.md](references/second-opinion.md). Broad codebase sweeps → [parallel-explore.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/parallel-explore.md). Large artifacts may optionally pre-gather via [parallel-plan-evidence.md](references/parallel-plan-evidence.md) — gather is not a substitute for debate.
- Completeness axes checklist body → [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) as the **completeness attacker overlay**, not a separate skill stance.

## Consumer bindings

Plan artifact paths (`.cursor/plans/`, ClickUp tasks, etc.) arrive as project-specific injected context on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). End with this block when both debate waves and synthesis are complete:

```markdown
## Second opinion summary

**Artifact:** [path or title]
**Dispatch:** adversarial-staged

### Findings

- [Critical gap or assumption — or "No material gaps"]

### Recommended next steps

- [Concrete action: implement, revise plan, pressure-test → **grill**, serialize → planning/build.md, investigate code path → **investigate**]
```
