---
name: ui-craft
description: Build or restyle a web page or app screen so it looks deliberate, compact and finished at phone and desktop widths. Use when making UI from a brief, design tokens, or an existing design system.
---

# UI Craft

Build the page a careful product designer would ship: compact, simple, aligned, with one obvious thing to do. The brief and the project's design system come first; these rules decide everything they leave open.

## Decide

- List every explicit instruction in the brief as a checklist.
- When the brief settles a direction, follow it exactly. When it does not, choose one direction yourself, state it in one line, and build it.
- Decide the layout per width before writing CSS: what the phone shows first, and how desktop uses its extra width.
- Choose the simplest structure for the content: rows for things people compare, cards only for items people act on one at a time.

## Build

1. **One primary action** per screen, solid accent and full size. Every other action is sized by its weight: per-item and secondary actions are small, outline or text.
2. **Compact, clearly separated.** Tight spacing inside an item; a visible separation between items (a hairline or one clear spacing step) so they never blur together. Size every region to its content, so no region holds more empty space than content.
3. **Flat.** Group with spacing and alignment first, hairlines second, one level of container at most.
4. **Few left edges.** Header, controls and content share the same edges at every width.
5. **Desktop uses its width.** Place related regions side by side (list beside detail, people beside highlights) so the page gets shorter. A single-column page is centred in a readable width; half the screen never sits empty. Keep prose under about 70 characters per line.
6. **Phone is designed.** Lead with the primary task. Small figures sit in one inline row. Per-item actions stay on one row: the main action plus compact secondary ones. Filters become one scrolling row or a disclosure.
7. **Summaries inline.** Counts and totals read as a compact row of label and number.
8. **Clear state.** Selected and current items differ by two cues (fill plus weight or an indicator); status badges use solid tokens.
9. **Themed controls.** `accent-color` and `color-scheme` come from the tokens; toggles and segmented controls fit their labels on one line.
10. **Long content.** Titles wrap; tables scroll inside their own container with whole-word cells; long FAQs and details collapse into disclosures.
11. **Nothing odd.** Every visible detail has a job: number items only when order matters, and skip decorative labels, badges and dividers.
12. **Tokens** for every colour, space, radius and type size.

## Check

Render at 390px and 1440px, plus dark mode when the tokens support it, and look at the screenshots:

- Every checklist item from the brief is visible.
- Squint: the primary action reads first.
- Every Build rule holds, especially compact but clearly separated items, small secondary actions, and no empty half-screens.
- Anything that looks odd at a glance (stray numbers, oversized buttons, a lonely wrapped word) gets fixed.
- One element can be removed without loss? Remove it.

Fix the worst finding and render again; repeat once. Report what you built and anything left unverified.

Rules drawn from blind UI-bench judgments and human grades in this repository, with ideas from [Construct Web Designer](https://www.tobiadonadon.com/projects/construct/material/skills/web-designer) and [frontend-design](https://github.com/PracticalSwan/agent-skills), reworded.
