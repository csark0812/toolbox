# Pricing page

## Job

A grad student who just hit the free plan's 100-paper limit decides whether to pay for Ledger, and which plan fits them or their lab.

## Direction

There is no visual direction yet and no one is available to choose one: decide the layout, density and look yourself, then build it.

## Must include

- The three plans from `content.json` with price, who each is for, and what each includes; make the Reader plan the recommended choice.
- A billing-period switch (monthly / yearly) that changes the shown prices.
- The FAQ from `content.json`.
- The main call to action (`id="primary"`) starts the Reader plan.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger tokens with `<link rel="stylesheet" href="../../shared/tokens.css">` and use them for colour, type, spacing and radius; do not edit `agent-suites/fixtures/ui-bench/shared/tokens.css`. The tokens file has no element or component styles: every layout, density and visual decision is yours. Use only the text in `content.json` (no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
