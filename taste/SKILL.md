---
name: taste
description: Load before writing markup whenever you build, rebuild or restyle a whole web page, site, app screen or flow (landing page, dashboard, checkout, settings, pricing calculator). Decides a direction from the subject, builds every state, screenshots and fixes it. Not a single CSS bug.
when_to_use: Requests such as "make a site for my café", "our homepage feels like a template", "design the orders screen for our staff tool", "give this pricing page some character", "rework this event page for mobile".
---

# Taste

<!-- source-of-truth: portable visual direction, page and screen craft, and the screenshot look-and-fix loop. -->
<!-- doc-meta: owner=eng -->
<!-- review-deps: paths=taste/scripts/** -->

A model's default page is the average of every page it has seen. This skill swaps each default for a choice drawn from the subject, builds them in full, and looks at the result in a real browser. User instructions, the project's brand and its design system outrank everything here.

**Utility comes first.** A page that does not do its job has failed, however it looks: the reader finds what they came for, the action works, the content is complete, and it loads fast and reads on a phone. Every choice below, wow included, serves that job and never costs it.

Work in few, large steps; every extra tool call re-reads the whole conversation. After loading this skill, the whole job is five turns and the reply:

1. One command that lists the project and prints its source files, each capped, for example `cd <project> && ls -R && for f in README* *.html *.css *.js; do echo "== $f"; head -c 6000 "$f"; done && head -n 5 data/*`: list data files and show their first lines, never the whole file. Add `<skill>/references/app-screens.md` for an app screen, `<skill>/references/ux.md` for anything with a form, flow, calculator, filters or settings, `<skill>/references/motion.md` only for a flow or custom motion beyond the rules below, `<skill>/references/range.md` for a person's site, a brief that asks for character, or several directions to compare, and `<skill>/references/showpiece.md` for a showcase (a portfolio, a launch, a brand page, or a request to wow). No separate look-around first.
2. One command that writes every file whole (heredocs) and ends by running the camera, with `--motion` for a showcase or any custom motion.
3. The camera's sheet opened, and its motion sheet too when filmed.
4. One command that applies every fix (rewrite a file, or one script with all the replacements; never one edit per change), runs the camera again with `--fails-only` and prints `git status --short`.
5. The sheet (and motion sheet) opened again.

A showcase adds passes after these five, on its one showpiece only, until it holds up beside the references ([showpiece](references/showpiece.md)).

## 1. Read the subject

From that one read, note the reader, the one thing they must do, fixed brand colours and type, and the imagery that truly exists. List **eight particulars** that belong to this subject and no competitor: its name, place and materials; the numbers in the brief; the constraint it lives with; the paper it already produces (tickets, labels, timetables, receipts).

- **A page** (read and scrolled: landing, shop, event): follow steps 2–6.
- **A person** (personal site, portfolio): a showcase; follow steps 2–6 with [range](references/range.md) and [showpiece](references/showpiece.md), and film it with `--motion`. The reader's first question is who this is and what they stand for; the first screen states a thesis in their own voice, quoting their own line word for word, not a job title. Particulars come from what they make and how they talk, not hobbies lifted from a résumé or metaphors of their job title. If the brief lacks them, ask once before building for their own philosophy line and a few seeds (what they are always into, a good Saturday, how they come across); invented credos miss every time. Their professional view leads; interests come second.
- **An app screen** (worked in: dashboard, rota, queue, admin): follow steps 2–6 with [app screens](references/app-screens.md) in place of the page rules on direction and fullness.
- **Something to do** (a checkout, sign-up, settings, a calculator or configurator, search and filters), on a page or a screen: also follow [hierarchy and UX](references/ux.md). List every state before writing: empty, no results, error beside each field, unsaved, saved, success. The visitor finishing the task is the design.

If the brief is vague, state your reading in one line and carry on.

## 2. Content first

Write one line per section, each a claim with its proof, in the order the reader needs them. Then the real copy:

- The first screen answers the reader's first question in large type: what this is, and where, when or how much. One supporting sentence. One primary action named for what it does, visible without scrolling on a phone (for a person, a plain link to their work or to write to them).
- Every headline fits in two lines (about 32 characters at a confident size).
- Every section the brief asks for carries its full information: the whole menu with prices, every route and fare, each answer. In a redesign keep every existing link and fact.
- Say each fact once, where the reader looks for it: one menu with the prices, one place for the hours, one for how to order. The first screen may name the key fact; no section repeats another.
- Write plainly, like the owner talking: the specific thing in plain words, the brief's own phrases kept. No taglines, quips, wordplay or slogan rhythm ("Baked once. Gone by one."), and no stock marketing lines ("without the hassle", "everything you need", "simple pricing", "made with love"). Headings name what is in the section ("Loaves and prices", "What it costs").
- Never invent proof: no customers, quotes, reviews, logos or statistics. Never invent details either (descriptions, origins, a "how it works"); leave out what the brief does not say. Sample copy and any rule you inferred from data (a schedule derived from first, last and interval) are listed in the reply.
- In a redesign, "keep the content" means every fact, link and price stays; stock headlines and filler headings are rewritten plainly, and each rewrite is listed in the reply.

## 3. Direction and idea

Write this sentence, both blanks from your particulars:

> **[A particular only this subject has]** shapes **[the page's layout, type or interaction]**.

For example: a ferry's departure board becomes the timetable; a market's chalked price board becomes the menu. If a competitor's name fits the sentence, find another idea. The idea must shape at least three sections, not just the first screen.

The rules below describe one way to build a page: full, poster-like screens. [Range](references/range.md) is a palette of other ideas (a quiet column, highlight marks, chapters in time, windows, a borrowed document, a reader view, a drawn scene, texture, a toy, a live fragment), each saying what kind of thing it is and where it fits. Combine the few your particulars earn, each in its place; where an idea's notes differ from the rules below, they win for that part of the page. Every metaphor, effect and interaction must answer a stranger's "what is the point of what I'm looking at?" with something true about the subject, or it goes; at most one showpiece per view.

Fix the system as CSS custom properties:

- **Type:** one family, two at most, chosen for the subject; a display size several steps above body (64–120px desktop, 36–56px phone, never smaller than the section headings); body 16–18px. Link web fonts (for example Google Fonts with `display=swap`) with a similar-width fallback, even when this machine is offline: visitors get them. A default system serif or sans on a pale ground with a blue button reads as a reskin, not a design.
- **Colour:** one ground, one ink, one accent for actions, at most one or two fields of colour, taken from the subject's own material. Not violet or indigo on near-black, not cream with terracotta, no gradients.
- **Layout:** one grid with equal outer margins; neighbouring sections use different forms (table, timeline, board, list, map); one dominant thing per screen.
- **Hierarchy:** step the rest down rather than the main thing up: a muted ink for secondary text, two weights, five to seven type sizes clearly apart. One filled primary action per view; others outlined or plain.
- **Motion:** custom properties for the durations and one ease-out curve, `cubic-bezier(.2,0,0,1)`: control feedback 100–150ms, small changes (a toggle, a total, a message) 150–250ms, panels and entrances 250–400ms. Flows and custom motion: [motion](references/motion.md).

**Never use:** small uppercase letter-spaced labels anywhere (above the `h1`, above sections, as kickers); pill badges; gradient text, buttons or backgrounds; glows and resting shadows; frosted nav; three identical icon cards; everything centred; an accent-styled word in a headline; 01/02/03 numbering; wave dividers; emoji or icons in tinted squares. [Direction](references/direction.md) has the reasoning if you need it.

## 4. Build it

Build in the existing stack with the project's tokens. Write each file in one go: tokens, then the first screen, then every section with real content, carrying the idea through pricing, timetables, FAQ and footer.

- **Imagery:** the project's own pictures; else subject material drawn in CSS or SVG (the route, the street, the label, the ticket); else type and colour alone. For software, show each feature as a small working fragment of its own interface, built in HTML with numbers that add up, never as an icon or a bare text list. Never fake photographs. A ruled or gridded background must line up with the text on it, or go.
- **Fullness:** each poster-built desktop screen is a poster. A screen that is largely blank, a hero with space above or beside it, or a band holding one short line is unfinished: use the width (two columns, a large figure, a wide table) or merge the thin section into its neighbour.
- **Fit:** long lists on a phone become compact rows or scroll inside their own region; tags and labels wrap rather than overflow their box.
- **Semantics:** one `h1`, a heading per section, real links and buttons with labels, alt text. Targets at least 24px everywhere and 44px on a phone, except links inside running text.
- **Feedback and motion, in the same pass:** every control has hover, press and `:focus-visible` states (a ring with 3:1 contrast against the colours beside it and against the unfocused control; `scroll-padding-top` so a sticky bar never covers it); selected choices look selected. The first screen is readable from its first frame (headline and action never start hidden, not even at low opacity) and settles within about 600ms; sections' parts rise a few pixels as they enter, staggered; only under a `.js` class the script adds may they start at opacity 0. Values that change (totals, counts, errors) change in place without shifting the layout. A `prefers-reduced-motion` block shows everything at rest.

## 5. Look at it

```bash
node <skill>/scripts/look.mjs <project-folder-or-html-file>
```

It photographs the page at 390 and 1440px (set `CHROME_PATH` if Chrome is not found), labels every check as FAIL or WARN, and prints the path of one sheet: the phone column beside the desktop screens. Open that one image; open a single screen only to read detail. On the rerun, `--fails-only` prints just the FAIL lines and the sheet. Add `--motion` for a showcase or any custom motion: it also films the widest width (the first screen loading, the pointer crossing it, the page scrolling) into one `motion` sheet; open it to judge the motion, which still screenshots cannot show.

Critique the sheet, not the code, in four lines in your notes: whether the page does its job (the reader's question answered, the action reachable, nothing missing); the five-second read of the first screen (can a stranger say who or what this is, and why this form?); the three biggest visible problems (empty stretches, weak hierarchy, a generic tell, overflow, cramped phone layout, missing content); and whether the idea survives past the first screen. Fix every `FAIL` and all three problems in one editing pass, run the camera again and open the sheet again. Stop after that second look unless a `FAIL` remains, or the page is a showcase whose showpiece does not yet hold up beside the references. If no browser can run, say the page is unverified.

In a git repository the pictures live inside `.git/`, so there is nothing to clean up; elsewhere delete `.taste/` before you finish.

## 6. Reply

- **Direction:** the idea sentence, and one line each on type, colour and layout and why they fit; then one line per idea taken from [range](references/range.md): its name there, where it sits, and the particular from the brief that earns it.
- **What was built:** the sections, the states and the motion, the files changed, how the phone layout differs.
- **Looked at:** the widths, the camera's final FAIL and WARN counts, the top remaining weakness.
- **To replace:** every invented detail, inferred rule and drawn stand-in, and every line of copy rewritten in a redesign.

State only results from commands that ran after your last edit; claim a picture was reviewed only if you opened it after the last change. See [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/references/v2/output-schema.md) § Work reports.
