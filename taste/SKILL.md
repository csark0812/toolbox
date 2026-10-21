---
name: taste
description: Use to build, redesign or polish a web page or app screen so it looks deliberately designed for its subject, not generic or AI-made. Decides a direction, builds it, then screenshots and fixes it. Not a single CSS bug.
when_to_use: Requests such as "build a landing page for", "make a website for our shop", "this page looks like every AI template", "make it look designed", "build the dashboard screen", "redesign this page, it's a mess on phones", "make it look premium".
---

# Taste

<!-- source-of-truth: portable visual direction, page and screen craft, and the screenshot look-and-fix loop. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

A page a model builds by default is the average of every page it has seen: a centred headline with a small label above it, a soft gradient, three icon cards, a glowing button. Nothing in it is wrong and nothing in it was decided. This skill replaces those defaults with decisions taken from the subject, builds them in full, and then looks at the result in a real browser until it holds up. User instructions, a project's brand and its design system outrank everything here.

## 1. Read the subject

Read the brief, the README, the existing page, the brand files and the data. Note what is real: the subject, the reader, the one thing the page must get them to do, the stack, fixed brand colours and type, and what imagery truly exists. Never plan around pictures you do not have.

Then list **eight to twelve particulars** in your notes: things that belong to this subject and to no competitor. Its name and what it means; its street, town, weather and materials; the numbers in the brief (prices, hours, seats, minutes); the constraint it lives with (bakes once a day, closed in winter); its rituals; the printed things of its world (a ticket, a timetable, a label, a receipt). The idea in step 3 comes from this list.

Decide which kind of work this is:

- **A page** is read and scrolled: a landing page, a shop, a portfolio, an event. Follow steps 2–7.
- **An app screen** is worked in: a dashboard, rota, queue, settings, admin view. Follow steps 2–7 with [app screens](references/app-screens.md) in place of the page rules.

If the brief is vague, decide and state your reading in one line; do not stop to ask. Ask only when a missing fact blocks the work entirely.

## 2. Write the content first

Write the page as plain text before markup: one line per section, each a claim with its proof, in the order the reader needs them. Delete a section with no claim. This, not a template, decides the sections. Then write the real copy:

- The first screen answers the reader's first question in large type: what this is, and where, when or how much. One supporting sentence. One primary action named for what it does.
- **Every headline fits in two lines** at every width. About 32 characters is safe at a confident size.
- Every section the brief asks for carries its full information: the whole menu with prices, every route and fare, each answer. Thin content is the commonest reason a clean page loses to a busier one.
- Sample details are fine where the brief leaves gaps; list them in the reply. Never invent proof: no customers, quotes, reviews, logos, press or statistics.

## 3. Choose a direction and an idea

Write this sentence before building, both blanks filled from your particulars:

> On this page, **[something that belongs to the subject]** becomes **[how the page is composed]**.

For example: the bakery's chalked sell-out board becomes the page's running order; the ferry's departure board becomes the timetable. Apply the **competitor test**: put the nearest competitor in the sentence. If it still works, the idea belongs to the category, not the subject; find another.

Then fix the system, as CSS custom properties that everything else uses:

- **Type:** one family, two at most, with a decisive scale (a display size several steps above body; body 16–18px, never smaller than 16px for running text). Load web fonts with a system fallback that keeps the layout.
- **Colour:** one ground, one ink, one accent, and at most one or two fields of colour, taken from the subject's own material where it has one. Not the assistant defaults: violet or indigo on near-black, cream with terracotta, rainbow accents.
- **Layout:** a grid with equal outer margins; sections that do not all share one layout; one dominant thing per screen.

Read [direction](references/direction.md) for type, colour, layout and imagery in more depth, and the list of generic tells to remove.

## 4. Build it

Build in the existing stack with the project's tokens and components. Order of work: tokens, the first screen at desktop and phone width, then each section with real content, carrying the idea past the first screen into pricing, timetables, FAQ and footer. A distinctive first screen followed by stock blocks is the commonest failure.

- **Imagery,** in order: the project's own; real subject material you can draw in CSS or SVG (a map of the street, the ferry route, the loaf's score marks, the product's own interface as a working fragment); type and colour alone. Never fake a product photograph, a screenshot of a product that does not exist, or a dashboard of grey bars. Without network access, do not link remote pictures you cannot see.
- **Fullness:** look at each desktop screen as a poster. A screen that is mostly empty ground is unfinished, not calm. Running text in full ink; grey for secondary notes only.
- **Semantics and states:** one `h1`, a heading on every section, real links and buttons, visible focus, alt text, a phone layout composed for the phone rather than a squeezed desktop.
- **Motion,** if any, after the still page works: transform and opacity only, a `prefers-reduced-motion` fallback, and nothing hidden if a script fails.

## 5. Look at it

A page is not done until you have looked at it. Run the bundled camera from the project folder:

```bash
node <skill>/scripts/look.mjs <project-folder-or-html-file>
```

It serves the folder, opens the page in headless Chrome (set `CHROME_PATH` if it is not found), scrolls once so scroll-triggered content appears, saves one screenshot per screen at 390, 768 and 1440px under `.taste/look/`, and prints measurements: sideways scroll and the element causing it, the `h1` count, headlines over two lines, low-contrast text, broken images, missing web fonts and page errors. Fix every `FAIL`. Treat each `WARN` as wrong unless you can defend it in one sentence.

Then **open every screenshot** with your file-reading tool and critique the pictures, not the code, with [critique](references/critique.md). Write the critique down, fix the three biggest problems, run the camera again and look again. Three rounds at most. If no browser can run, say so: the page is unverified, not done.

Delete `.taste/` before you finish unless the user wants the screenshots; it is working material, not product.

## 6. Exit

The reply contains, in this order:

- **Direction:** the idea sentence, and in one line each the type, colour and layout choices and why they fit this subject.
- **What was built:** the sections, the files changed (from `git status`), and how the phone layout differs from the desktop.
- **Looked at:** the widths rendered, the camera's final FAIL and WARN counts, and the last critique's top remaining weakness.
- **To replace:** every invented sample detail and every drawn stand-in for a photograph.

**Reply check.** Every result you state names a command that appears in your actions and ran after your last edit. Claim a screenshot was reviewed only if you opened it after the last change.

See [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md) § Work reports.
