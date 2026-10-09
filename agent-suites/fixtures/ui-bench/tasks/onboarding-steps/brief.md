# Onboarding

## Job

A new user sets up Ledger in under a minute: pick research fields, import papers, choose reading defaults.

## Direction (settled)

Friendly but restrained first-run flow. Centered column (max ~36rem), one step visible at a time, clear progress indicator (step x of 3), large tap targets. Serif step titles, accent colour only on the primary action and current-step marker.

This direction is decided. Build it; do not propose alternatives.

## Must include

- Progress indicator for 3 steps with the current step marked.
- Step content from `content.json`; step 1 visible by default.
- Back and Next/Finish controls; the forward action is `id="primary"`. Back is not offered on step 1.
- States: `?step=2` and `?step=3` show those steps directly.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger design system with `<link rel="stylesheet" href="../../shared/design-system.css">` and use its tokens; do not edit `agent-suites/fixtures/ui-bench/shared/design-system.css`. Use only the text in `content.json` (copy it into the page; no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
