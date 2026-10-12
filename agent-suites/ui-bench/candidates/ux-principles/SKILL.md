---
name: ux-principles
description: Build or restructure an app screen from the user's task outward using established UX principles, composed from the project's own design system. Use when creating a new screen, page, flow or substantial component.
---

# UX Principles

Design the screen around what the user came to do, then express it with the project's existing components. Good UX here means the right information in the right order, obvious next actions, and honest states, not decoration.

## 1. Frame the task

Write down, before any code:

- **Job:** the one thing the user came to this screen to do, and the decision they make here.
- **Primary action:** the single action that completes the job.
- **Information, ranked:** every piece of content, ordered by how much the job needs it. The top two get the most prominent positions; the bottom third goes behind a disclosure, a secondary view, or out.

## 2. Choose the structure

Pick the pattern the ranked content implies, using components the design system already has:

- **Scan and act on many items:** a list or table of rows with the key value aligned for comparison and per-item actions on the row.
- **One item in depth:** a summary header with the key fact first, then grouped detail.
- **Make a choice:** options side by side with the differences aligned and the recommended one marked.
- **Enter data:** one column of labelled fields in the order people think of them, with the primary action at the end.

Reuse the design system's layout, row, field, button and feedback components before writing new styles. Match how existing screens do the same job.

## 3. Apply the principles

- **Hierarchy:** one dominant element per screen (the job's answer or the primary action); everything else steps down in size, weight or colour.
- **Grouping:** related items sit close together and share alignment; unrelated groups are separated by space or a divider (proximity and common region).
- **Recognition over recall:** show the current state, totals and context the user needs to decide; never make them remember it from another screen.
- **Progressive disclosure:** details, rare actions and explanations appear on demand, not up front.
- **Feedback and states:** design the empty, loading, error, and success states with specific copy and a next step.
- **Error prevention:** constrain inputs, confirm destructive actions, and show consequences (for example, the resulting balance) before commit.
- **Consistency:** same words, icons and placements as the rest of the app; numbers formatted the same way everywhere.
- **Targets and reach:** frequent actions are large and close to where attention already is; destructive ones are smaller and separated.

## 4. Check with fresh eyes

Render the screen at phone and desktop widths. Then ask a fresh subagent, given only the screenshots and the job from step 1, to name what it would look at first, what it would do next, and the three changes that would most improve the screen. Apply the changes that serve the job, render again, and keep the better version.

Report the job, the structure you chose, and anything you could not verify.
