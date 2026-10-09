# Annotations review

## Job

Before a lab meeting, a researcher reviews every highlight and note they made in one paper and decides which ones to bring up.

## Direction (settled)

Dense but orderly tool UI. Two panes on desktop: a list of annotations on the left, the selected annotation with its source passage on the right. On phones the list comes first and the detail follows below (or opens in place). Neutral surfaces, highlight colours only as small markers. System sans for UI text, serif only for quoted passages.

This direction is decided. Build it; do not propose alternatives.

## Must include

- List of annotations showing the quoted passage (truncated), the note's first line, its tag, and page.
- Detail of the selected annotation: full passage, full note, tag, page, and a 'Add to meeting agenda' button (`id="primary"`).
- Filter by tag (All, Question, Key finding, Limitation).
- State: `?state=empty` shows the no-annotations copy from `content.json`.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger design system with `<link rel="stylesheet" href="../../shared/design-system.css">` and use its tokens; do not edit `agent-suites/fixtures/ui-bench/shared/design-system.css`. Use only the text in `content.json` (copy it into the page; no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
