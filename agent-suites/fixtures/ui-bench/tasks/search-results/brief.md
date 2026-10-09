# Search results

## Job

A researcher searches their own library and annotations for 'sharp-wave ripples' to find where they read about it.

## Direction (settled)

Search-first utility page. Prominent search field at the top; results as a clean list with highlighted matched terms (use a subtle background, not bold colour blocks). Filters in a sidebar on desktop, behind a 'Filters' disclosure on phones. Compact metadata line under each title.

This direction is decided. Build it; do not propose alternatives.

## Must include

- Search field pre-filled with the query and a Search button (`id="primary"`).
- Result count and the results from `content.json`, each with title, where the match is (paper or annotation), snippet with the matched term highlighted, and metadata.
- Filters: type (Papers, Annotations) and year range.
- State: `?state=none` shows the no-results copy from `content.json`.

## Constraints

Build it as `index.html` in this folder (add `styles.css` or a small inline script if you need them). Link the Ledger design system with `<link rel="stylesheet" href="../../shared/design-system.css">` and use its tokens; do not edit `agent-suites/fixtures/ui-bench/shared/design-system.css`. Use only the text in `content.json` (copy it into the page; no lorem ipsum). Give the main call to action `id="primary"`. No external fonts, images, or network requests. It must work from 320px phones to 1440px desktops, in light and dark mode, and with keyboard only.
