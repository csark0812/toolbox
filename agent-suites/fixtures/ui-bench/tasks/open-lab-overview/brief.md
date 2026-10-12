# Lab overview

## Job

A PI opens Ledger before the weekly lab meeting to see what the lab read, what stood out, and who to follow up with.

## Direction

There is no visual direction yet and no one is available to choose one: decide the layout, density and look yourself, then build it.

## Must include

- The weekly totals from `content.json`.
- Each member's activity this week (papers read, highlights, last active).
- The highlighted passages flagged for the meeting, with who flagged them and the paper.
- The main call to action (`id="primary"`) exports the meeting agenda.
- State: `?state=empty` shows the no-activity copy from `content.json`.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger tokens with `<link rel="stylesheet" href="../../shared/tokens.css">` and use them for colour, type, spacing and radius; do not edit `agent-suites/fixtures/ui-bench/shared/tokens.css`. The tokens file has no element or component styles: every layout, density and visual decision is yours. Use only the text in `content.json` (no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
