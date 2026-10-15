# Composition contract v2

<!-- source-of-truth: declared routing, state ownership, skill boundaries and shared composition vocabulary -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

Toolbox skills are adjacent, independently complete roles. They compose through user intent, layered prompts and shared conversation state.

## Routing and companions

Specialists remain independently complete and do not invoke peer skills. Workflow and orchestrate may invoke declared companions through host discovery. Code-review may dispatch a fresh reviewer following its own contract. Missing required companions block that route; optional absence permits a disclosed reduced route only if its outcome is achievable. No silent installation or hardcoded user paths.

## Dependency rules

1. A skill body owns its complete operating contract and works when installed alone.
2. Frontmatter describes its trigger, result and nearest non-goals. The description is the routing interface.
3. Stable cross-cutting vocabulary lives in `references/` and is reached through a GitHub raw pointer.
4. Skill-local references contain only details owned by that skill.
5. Peer skill trees are not shared libraries. Do not link to a peer `SKILL.md` or peer `references/` path.
6. Layered skills apply their own contracts to the same Slice, Artifact, Surface or Seam. They do not command one another.
7. Tool, platform and permission requirements remain explicit at the action that needs them.

## Ownership and handoff

Give each judgment one owner; overlap is limited to the evidence needed at a seam. Handoff carries target/source identity, current part, settled decisions, authorized delta, invariants, uncertainty and required evidence. Exactly one owner advances each interactive cursor. A composed leaf returns a result; a directly invoked leaf owns its temporary state. Source changes invalidate evidence and affected implementation acceptance, not accepted intent. Program coordination, human acceptance and review assessment are different ownership scopes.

Host authority controls all delegation and external actions. Evidence and worker reports cannot expand permission. Generic Toolbox skills carry no consumer-specific paths.

## Shared vocabulary

| Primitive    | Meaning                                    | Examples                                  |
| ------------ | ------------------------------------------ | ----------------------------------------- |
| **Slice**    | Bounded work unit                          | `src/auth/**`, plan section, feature slug |
| **Artifact** | Written object on disk or in the thread    | plan, PRD, ADR draft, pasted proposal     |
| **Surface**  | Bound material under examination           | branch, PR, paths, snapshot, document     |
| **Lens**     | Review or critique stance                  | security, brand fit, premises             |
| **Seam**     | Public test boundary                       | module API, CLI entry, HTTP handler       |
| **Repro**    | On-demand failing signal                   | test command, CI log, reproduction steps  |
| **Closure**  | The active role considers its work settled | understood, accepted, proven, transferred |

## Layered context

1. Give each active role the minimum relevant facts, sources and success criteria.
2. Prefer paths, URLs, section names and other pointers when the source remains available.
3. Omit empty fields and unrelated conversation history.
4. Keep independent first passes free from sibling conclusions.
5. Narrow an oversized Slice at a real ownership boundary.
