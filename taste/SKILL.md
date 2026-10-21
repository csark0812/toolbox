---
name: taste
description: Use to build, redesign or restyle a web page, site or app screen (dashboard, internal tool, admin view) so it looks designed for its subject, not generic. Decides a direction, builds it, screenshots and fixes it. Not a single CSS bug.
when_to_use: Requests such as "make a site for my café", "our homepage feels like a template", "design the orders screen for our staff tool", "give this pricing page some character", "rework this event page for mobile".
---

# Taste

<!-- source-of-truth: portable visual direction, page and screen craft, and the screenshot look-and-fix loop. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

A model's default page is the average of every page it has seen. This skill replaces those defaults with decisions taken from the subject, builds them in full, and looks at the result in a real browser. User instructions, the project's brand and its design system outrank everything here.

Work in few, large steps: read everything in one command, write each file whole, look, fix everything in one pass, look once more. Every extra tool call re-reads the whole conversation.

## 1. Read the subject

Read the brief, README, existing page, brand files and data in one command. Note the reader, the one thing they must do, fixed brand colours and type, and the imagery that truly exists. List **eight particulars** that belong to this subject and no competitor: its name, place and materials; the numbers in the brief; the constraint it lives with; the printed things of its world (a ticket, a label, a board).

- **A page** (read and scrolled: landing, shop, event): follow steps 2–6.
- **An app screen** (worked in: dashboard, rota, queue, admin): follow steps 2–6 with [app screens](references/app-screens.md) in place of the page rules.

If the brief is vague, state your reading in one line and carry on.

## 2. Content first

Write one line per section, each a claim with its proof, in the order the reader needs them. Then the real copy:

- The first screen answers the reader's first question in large type: what this is, and where, when or how much. One supporting sentence. One primary action named for what it does, visible without scrolling on a phone.
- Every headline fits in two lines (about 32 characters at a confident size).
- Every section the brief asks for carries its full information: the whole menu with prices, every route and fare, each answer. In a redesign keep every existing link and fact.
- Never invent proof: no customers, quotes, reviews, logos or statistics. Sample copy and any rule you inferred from data (a schedule derived from first, last and interval) are listed in the reply.

## 3. Direction and idea

Write this sentence, both blanks from your particulars:

> On this page, **[something that belongs to the subject]** becomes **[how the page is composed]**.

For example: a ferry's departure board becomes the timetable; a market's chalked price board becomes the menu. If a competitor's name fits the sentence, find another idea. The idea must shape at least three sections, not just the first screen.

Fix the system as CSS custom properties:

- **Type:** one family, two at most; a display size several steps above body (64–120px desktop, 36–56px phone); body 16–18px. Web fonts with a similar-width fallback.
- **Colour:** one ground, one ink, one accent for actions, at most one or two fields of colour, taken from the subject's own material. Not violet or indigo on near-black, not cream with terracotta, no gradients.
- **Layout:** one grid with equal outer margins; neighbouring sections use different forms (table, timeline, board, list, map); one dominant thing per screen.

**Never use:** small uppercase letter-spaced labels anywhere (above the `h1`, above sections, as kickers); pill badges; gradient text, buttons or backgrounds; glows and resting shadows; frosted nav; three identical icon cards; everything centred; an accent-styled word in a headline; 01/02/03 numbering; wave dividers; emoji or icons in tinted squares. [Direction](references/direction.md) has the reasoning if you need it.

## 4. Build it

Build in the existing stack with the project's tokens. Write each file in one go: tokens, then the first screen, then every section with real content, carrying the idea through pricing, timetables, FAQ and footer.

- **Imagery:** the project's own pictures; else subject material drawn in CSS or SVG (the route, the street, the label, the product's own interface as a working fragment with numbers that add up); else type and colour alone. Never fake photographs or screenshots.
- **Fullness:** each desktop screen is a poster. A screen that is mostly empty ground, or a column with nothing beside it, is unfinished. Use the width: two columns, a large figure, a wide table.
- **Fit:** long lists on a phone become compact rows or scroll inside their own region; tags and labels wrap rather than overflow their box.
- **Semantics:** one `h1`, a heading per section, real links and buttons, visible focus, alt text. Motion only after the still page works, with a `prefers-reduced-motion` fallback.

## 5. Look at it

```bash
node <skill>/scripts/look.mjs <project-folder-or-html-file>
```

It serves the folder, opens it in headless Chrome (set `CHROME_PATH` if not found), and prints measurements: sideways scroll and its cause, `h1` count, long headlines, low contrast, broken images, page errors. It writes one picture per width (390 and 1440px) showing every screen in reading order: open both `look` pictures it prints with your file-reading tool. Open a single screen from the folder only when you need to read detail.

Critique the pictures, not the code, in four lines in your notes: the five-second read of the first screen; the three biggest visible problems (empty stretches, weak hierarchy, a generic tell, overflow, cramped phone layout, missing content); and whether the idea survives past the first screen. Fix every `FAIL` and all three problems in one editing pass, run the camera again and open the pictures again. Stop after that second look unless a `FAIL` remains. If no browser can run, say the page is unverified.

Delete `.taste/` before you finish.

## 6. Reply

- **Direction:** the idea sentence, and one line each on type, colour and layout and why they fit.
- **What was built:** the sections, the files changed, how the phone layout differs.
- **Looked at:** the widths, the camera's final FAIL and WARN counts, the top remaining weakness.
- **To replace:** every invented detail, inferred rule and drawn stand-in.

State only results from commands that ran after your last edit; claim a picture was reviewed only if you opened it after the last change. See [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md) § Work reports.
