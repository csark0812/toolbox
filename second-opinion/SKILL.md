---
name: second-opinion
description: Written plan / PRD / issue-set review via staged adversarial subagents — premises attack + completeness attack, then a related-context defender. Not for dialogue without a plan artifact or a single code-path hunch.
disable-model-invocation: true
---

# Second opinion

**Source of truth for** written plan review via staged multi debate.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-22 -->

You are not having a Socratic **explore** session — the artifact is a **plan** (or PRD / issue set). Follow [references/second-opinion.md](references/second-opinion.md). Dispatch → [references/adversarial-debate.md](references/adversarial-debate.md) + [`multi` adversarial.md](../multi/references/adversarial.md) § Staged debate.

**No Stance A/B.** Outsider premise critique and completeness/axis readiness always run **in tandem** as Wave-1 subagent roles. Do not ask “fresh read or verify?”

## When to Use

- Written plan on disk, `.cursor/plans/*.plan.md`, PRD, or issue set
- "Second opinion", "did I miss anything", freshness or completeness pass

Not for: dialogue without a plan ([`crystallize`](../crystallize/SKILL.md), [`grill`](../grill/SKILL.md)), single code-path hunch ([`investigate`](../investigate/SKILL.md)).

## Does not own

- Dialogue without a plan artifact → **crystallize** or **grill**
- Author a new plan from intent → **crystallize** or **grill** → [build.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/build.md)
- Single code-path hunch with evidence → **investigate**
- Protocol + output sections → [references/second-opinion.md](references/second-opinion.md)

## Stance and repo

- **Primary-source-first for the defender wave:** Wave 2 receives 2–4 primary sources the plan cites — code files, docs, data, or prior decisions; do not ask the user for paths that appear in the plan. Wave 1 attackers get the **artifact only** (context asymmetry).
- Structural “worth deepening?” → brief notes in synthesis per [second-opinion.md](references/second-opinion.md). Broad codebase sweeps → [parallel-explore.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/parallel-explore.md). Large artifacts may optionally pre-gather via [parallel-plan-evidence.md](references/parallel-plan-evidence.md) — gather is not a substitute for debate.
- Completeness axes checklist body → [verify.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/planning/verify.md) as the **completeness attacker overlay**, not a separate skill stance.

**Ambient routing:** inline axis pass on artifacts → [agent-routing.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/agent-routing.md) § Plan on disk; full second-opinion remains user-invoked.

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
