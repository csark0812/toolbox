# Paper library

## Job

A researcher opens Ledger to get back into a paper they were reading. The page must make 'resume the paper I was last in' the obvious first action, then let them scan the rest of their library.

## Direction (settled)

Calm, editorial reading app. Serif headings from the design system, generous whitespace, one accent colour (the design-system accent) used only for the primary action and progress. A single-column list on phones, list with a slim filter sidebar on desktop. No cards with heavy shadows; rows separated by hairline borders.

This direction is decided. Build it; do not propose alternatives.

## Must include

- A prominent 'continue reading' area for the most recently opened paper with its progress and a Resume button (`id="primary"`).
- The rest of the library as a scannable list: title, authors, venue · year, reading progress, collection.
- Filter by collection (All plus each collection).
- States: `?state=empty` shows the empty-library state; `?state=loading` shows a loading state. Use the copy from `content.json` for both.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger design system with `<link rel="stylesheet" href="../../shared/design-system.css">` and use its tokens; do not edit `agent-suites/fixtures/ui-bench/shared/design-system.css`. Use only the text in `content.json` (copy it into the page; no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
