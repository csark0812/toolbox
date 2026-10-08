# Direction and proof

<!-- source-of-truth: compact handoff and evidence contract for interface-design. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-07 -->

## Direction card

Write only the decisions the implementer needs:

- User task and primary action; audience and content source.
- Selected concept and the visual default it intentionally avoids.
- First-screen hierarchy and page grammar or app shell.
- Typography, color roles, spacing/grid, imagery or other feasible richness source.
- Interaction thesis only when motion or manipulation serves the task; reduced-motion end state.
- Project design-system constraints, non-goals, and unresolved product choices.

A board is a decision aid. If two viable options depend on real wrapping, screen geometry, or motion, compare disposable first-screen renders before asking for a choice. User-provided direction skips the board gate.

## Review gates

| Gate             | Evidence                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Task and content | Primary action and actual content visible in the right place; claims and sample data identified.                          |
| States           | Reachable loading, empty, error, success, disabled, and recovery states checked as relevant.                              |
| Access           | Semantics, names, keyboard order, visible focus, contrast, target size, zoom and reduced motion checked.                  |
| Layout           | Narrow, middle, and wide widths plus long content and the smallest supported width checked for clipping and lost actions. |
| Platform         | Browser and operating-system simulations labeled as such; required skipped or crashed passes reported as unverified.      |
| Craft            | Full-size screenshots inspected for coherent hierarchy, type, imagery, spacing, and purposeful motion.                    |

Relevant inspiration: [Construct Web Designer](https://www.tobiadonadon.com/projects/construct/material/skills/web-designer) for rendered direction comparison and platform checks; [Construct Art Director](https://www.tobiadonadon.com/projects/construct/material/skills/art-director) for first-screen visual critique. Their taste rules are examples, not portable requirements. Optional visual sources: [Vibrant](https://vibrant.design/) and [Refero Styles](https://styles.refero.design/). Motion references belong in the brief only when motion serves the task.
