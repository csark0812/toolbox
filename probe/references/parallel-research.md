# Parallel Research

Independent web topics in parallel. Uses [`subagents`](../../subagents/SKILL.md) kernel — [non-negotiables](../../subagents/SKILL.md#non-negotiables), [task-prompt.md](../../subagents/references/task-prompt.md), [member-schema.md](../../subagents/references/member-schema.md).

Profile: `web` — skip council agent scoring.

## When to use

- Multiple unrelated library/API/policy questions
- Doc comparison across vendors or spec versions
- User explicitly wants parallel research passes

## When to skip

- Single topic — one agent or context7 MCP is enough
- Answer is in repo docs — read repo first
- Code hunch about repo behavior — standard **investigate** (generalized), not this multi-topic recipe
- Single non-code hunch with a specific target — standard **investigate** (generalized), not this multi-topic recipe. This recipe stays scoped to genuinely independent multi-topic fact-gathering. It does not produce an investigate verdict — that is **investigate**'s core protocol.
- Council code review — **code-review**

## Members (1 per topic)

| Slice   | Subagent                              | Tier     |
| ------- | ------------------------------------- | -------- |
| Topic A | `docs-researcher` or `generalPurpose` | Standard |
| Topic B | `docs-researcher` or `generalPurpose` | Standard |

Prefer Auto for all topics (`inherit-auto` or `model=auto` if enum supports it). Explicit model slugs require slice-fit + Cursor cost justification per [model-routing.md](../../subagents/references/model-routing.md). Do not use `*-fast` in parallel. Diversify via distinct prompts/stances, not price.

## Dispatch plan template

```markdown
Task: [research goal]
Classification: research
Source of truth: web
Goal: coverage

Parent model: [Auto | <named>]
User model overrides: [none | member=slug, …]
Auto reachable: [inherit-auto | model=auto | no]
Host supports: [Task model enum]
Billing pool: [first-party | API | mixed]
Explicit model slugs used: none
Fast variants used: none

Selected members:

- docs-researcher · tier=Standard · model=inherit-auto · stance=n/a: [topic A — specific query]
- docs-researcher · tier=Standard · model=inherit-auto · stance=n/a: [topic B]

Synthesis plan: merge facts. Flag source class per claim. Flag conflicting sources. Cite URLs. Preserve conflicts
```

Fallback: `docs-researcher` unavailable → `generalPurpose` with "web research" in sub-task.

## Synthesis

1. State the answer for each topic once with source links and **source class** (primary vs secondary, official vs commentary).
2. Flag conflicts between sources — do not flatten.
3. High-stakes claims need **lateral corroboration** (who else says this?) before treating as settled. If conflict is unresolved, note it explicitly or hand a specific claim back to **investigate**.
4. High-stakes contradiction → sequential tiebreaker per [model-routing.md](../../subagents/references/model-routing.md) or ask user.
5. Output → [subagents output-format.md](../../subagents/references/output-format.md).
