<!-- skeleton: generated-reference
source: .skeleton/references/planning/parallel-explore.md
redundancy: intentional
-->

# Parallel Explore

**Portable soft-default (consumer remaps apply):** Toolbox ships Linear / `docs/prds/` baselines for consumers with **no** remap. **STOP:** If the consumer remaps this path via customize (`shared-agent-references` / docs), **do not execute the steps below** — open the consumer planning SSOT only. Do not treat `docs/prds/` or path examples below as authoritative when remapped.

Blast-radius mapping and subsystem discovery. Uses [`multi`](../../../multi/SKILL.md) kernel — [non-negotiables](../../../multi/SKILL.md#non-negotiables), [task-prompt.md](../../../multi/references/task-prompt.md), [member-schema.md](../../../multi/references/member-schema.md).

Profile: `manual` or `repo`.

## When to use

- Planning a feature and need surface-level structure across domains ([`build.md`](build.md) Step 3)
- Grill branch depends on repo facts — explore before asking the user
- Second-opinion Stance A needs a broad codebase sweep beyond 2–4 cited files

## When to skip

- Single-component change; paths already in context from this session
- User wants one authoritative pass
- Target is one file or hook — use direct read or **investigate**

## Members (2–4)

Split by **domain**, not file:

| Slice            | Subagent  | Tier | Example                                      |
| ---------------- | --------- | ---- | -------------------------------------------- |
| Backend / API    | `explore` | Fast | backend / API domain package (or equivalent) |
| Client data + UI | `explore` | Fast | client data layer + UI routes                |
| Shared packages  | `explore` | Fast | shared packages / UI kit paths               |

Optional: score council agents on `task_paths[]` from the plan — spawn `architecture` or `correctness` only when cited paths match and `dispatch.contexts` includes `repo`. Path matching → [agent-discovery.md](../../../multi/references/agent-discovery.md).

## Dispatch plan template

```markdown
Task: [explore goal — e.g. "map auth touchpoints for scoring feature"]
Classification: explore
Source of truth: repo
Goal: coverage

Selected members:

- explore · tier=Fast · model=[cheapest] · stance=n/a: [backend slice]
- explore · tier=Fast · model=[cheapest] · stance=n/a: [client slice]

Why these members: independent domains; no cross-member dependencies
Synthesis plan: merge scope maps; flag overlaps and blast-radius gaps
```

Compose prompts per [task-prompt.md](../../../multi/references/task-prompt.md).

## Synthesis

1. Merge non-overlapping structure maps per domain.
2. Surface **blast radius** — what the plan did not cite but is affected.
3. Preserve conflicts (e.g. two members disagree on ownership).
4. Output → [multi output-format.md](../../../multi/references/output-format.md).

## Handoff

- Planning continues in **build** / **grill** with exploration context.
- Second-opinion author writes final Stance A sections — multi supplies evidence, not the opinion shape.
