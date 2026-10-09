# Plan and billing settings

## Job

A user wants to switch plans and update their billing email without surprises about price or what they lose.

## Direction (settled)

Quiet, trustworthy settings surface. Left-aligned single column (max ~44rem) on all sizes, sections separated by headings and hairlines, not boxed cards. Plans shown as a selectable comparison where the current plan is clearly marked. Errors use the design-system danger colours and are announced next to the field.

This direction is decided. Build it; do not propose alternatives.

## Must include

- Current plan summary (plan, price, renewal date).
- Plan choice between the three plans in `content.json`, with what each includes; the current plan clearly marked.
- Billing email field and a 'Save changes' button (`id="primary"`).
- State: `?state=error` shows the validation error from `content.json` on the billing email field.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger design system with `<link rel="stylesheet" href="../../shared/design-system.css">` and use its tokens; do not edit `agent-suites/fixtures/ui-bench/shared/design-system.css`. Use only the text in `content.json` (copy it into the page; no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
