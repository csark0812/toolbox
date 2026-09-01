# Context pack

<!-- source-of-truth: shared composition vocabulary and minimum context rules for toolbox process skills. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Process skills define what the work means. Council supplies multi-agent depth when the user attaches or names it.

## Shared vocabulary

| Primitive    | Meaning                                  | Examples                                  |
| ------------ | ---------------------------------------- | ----------------------------------------- |
| **Slice**    | Bounded work unit                        | `src/auth/**`, plan section, feature slug |
| **Artifact** | Written object on disk or in the thread  | plan, PRD, ADR draft, pasted proposal     |
| **Surface**  | Review or diff adapter                   | branch, PR, paths, snapshot               |
| **Lens**     | Review or critique stance                | security, brand fit, premises             |
| **Seam**     | Public test boundary                     | module API, CLI entry, HTTP handler       |
| **Repro**    | On-demand failing signal                 | test command, CI log, reproduction steps  |
| **Closure**  | Process skill considers its work settled | ready, open, crystallized, cited verdict  |

## Composition

- Layered skills apply their own entry gates and non-negotiables to the same Slice or Artifact.
- A process skill owns member craft and its final output shape.
- Council owns task personas, interaction choice, member execution, and synthesis.
- Handoff owns cross-session transfer.

## Context rules

1. Give each member the minimum relevant facts, sources, and success criteria.
2. Prefer paths, URLs, section names, and other pointers over copied bodies when members can read the source.
3. Omit empty fields and unrelated chat history.
4. Do not give first-round members sibling conclusions.
5. If the task is too broad for useful independent work, narrow the Slice or split the run at a real ownership boundary.

Council member prompt → [persona-prompt.md](persona-prompt.md).
