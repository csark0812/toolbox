# CSS technique map

<!-- source-of-truth: compact navigation across the CSS decisions inherited from modern-css. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-07 -->

Use the affected behavior to pick one area. The original `modern-css` references are retained in Toolbox under `references/original-skills/modern-css/` for source comparison, but this skill works without them.

| Problem                | Start with                                                                                                    | Verify                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Cascade or specificity | Origin, importance, layer order, scope, selector specificity                                                  | The winning declaration in the affected state; avoid a global layer change for a local fix.                                        |
| Layout                 | Flex for one axis, Grid for two, subgrid or container queries when alignment or available space requires them | Intrinsic sizing, min/max constraints, overflow, reading order, narrow width.                                                      |
| Selectors              | Semantic state and `:focus-visible`; `:has()` only when relational state is truly needed                      | Selector support, keyboard state, specificity and performance on the actual DOM.                                                   |
| Color                  | Existing semantic roles; `oklch()` or `color-mix()` for a new system-level need                               | Contrast on the rendered background, gamut and fallback, dark and forced colors.                                                   |
| Tokens                 | Existing custom properties and component variants                                                             | Correct inheritance, theme switching, fallback values, no consumer anatomy override.                                               |
| Animation              | State transition, entry/exit lifecycle, reduced-motion final state                                            | Interruption, focus, visible content without JavaScript, feature support.                                                          |
| Scroll                 | Native sticky or scroll-driven behavior where it fits                                                         | Scroll container, keyboard/touch behavior, reduced motion and browser fallback.                                                    |
| Native controls        | Dialog, popover, select, anchor positioning, field sizing when supported                                      | Semantics, focus, dismissal, input mode, fallback in target browsers.                                                              |
| Performance and text   | Containment or content visibility for measured cost; logical properties and text wrapping for content         | Layout shift, find-in-page/accessibility, zoom, writing direction, long text.                                                      |
| Quick feature choice   | Smallest feature that solves the observed problem                                                             | [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) and [Web Platform Status](https://webstatus.dev/) for current support. |

[good-css](https://good-css.com/) groups live techniques by foundations, layout, spacing, text, interaction, motion, visibility, and scroll. Its repository is [MIT licensed](https://github.com/vojtaholik/good-css); cite a specific specimen when it informed a choice. Preserve a project's framework and design system over a specimen's default styling.
