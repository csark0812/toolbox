# Reading queue

## Job

A researcher triages the papers they saved this week: decide what to read now, what to keep for later, and what to drop. They do this most mornings, often on a phone.

## Direction

There is no visual direction yet and no one is available to choose one: decide the layout, density and look yourself, then build it.

## Must include

- The queue of papers from `content.json` with title, authors, venue, saved date, length and why it was saved.
- Per-paper actions: Read now, Later, Drop. The main call to action (`id="primary"`) starts reading the top paper.
- Counts for the queue, Later and read this week.
- State: `?state=empty` shows the empty-queue copy from `content.json`.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger tokens with `<link rel="stylesheet" href="tokens.css">` (already in this folder) and use them for colour, type, spacing and radius; do not edit `tokens.css`. The tokens file has no element or component styles: every layout, density and visual decision is yours. Use only the text in `content.json` (no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
