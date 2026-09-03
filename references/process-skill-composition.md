# Process skill composition

<!-- source-of-truth: dependency and ownership philosophy for independently installed toolbox skills. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-02 -->

Toolbox skills are adjacent, independently complete roles. They compose through user intent, layered prompts, and shared conversation state. A skill does not invoke a peer skill or depend on a peer package.

## Ownership

Give each judgment one owner. Overlap is limited to the evidence needed at a seam.

| Role          | Owned question                                                | Exit state                                               |
| ------------- | ------------------------------------------------------------- | -------------------------------------------------------- |
| Understand    | What happens, in what causal order, and why?                  | Covered, skipped, and uncertain areas are explicit.      |
| Judge and own | Does the work fit the developer's preferences and intent?     | Each area is accepted, changed, skipped, or uncertain.   |
| Transform     | How does an accepted target replace the current shape safely? | One bounded change is proven and old residue is handled. |

The current skills that own these roles are listed in the hub taxonomy. Keep that mapping outside skill bodies.

## Seam contract

A role receives an exact Surface, the active causal position, settled decisions, and material uncertainty. It returns its own exit state in conversation or in the artifact. The next role starts from that state without restarting settled work.

Source drift invalidates evidence, not accepted intent. Rebind the Surface, recheck affected anchors, and resume at the same causal position.

## Dependency rules

1. A skill body owns its complete operating contract and works when installed alone.
2. Frontmatter describes its trigger, result, and nearest non-goals. The description is the routing interface.
3. Stable cross-cutting vocabulary lives in `references/` and is reached through a GitHub raw pointer.
4. Skill-local references contain only details owned by that skill.
5. Peer skill trees are not shared libraries. Do not link to a peer `SKILL.md` or peer `references/` path.
6. Layered skills apply their own contracts to the same Slice, Artifact, Surface, or Seam. They do not command one another.
7. Tool, platform, and permission requirements remain explicit at the action that needs them.

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

1. Give each active role the minimum relevant facts, sources, and success criteria.
2. Prefer paths, URLs, section names, and other pointers when the source remains available.
3. Omit empty fields and unrelated conversation history.
4. Keep independent first passes free from sibling conclusions.
5. Narrow an oversized Slice at a real ownership boundary.

Load this reference only when skill ownership, composition, or dependency placement is in question.
