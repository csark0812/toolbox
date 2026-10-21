# App screens

<!-- source-of-truth: taste rules for screens people work in: dashboards, rotas, queues, settings. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

An app screen is worked in, often all day. It earns its look through clarity, density and correct numbers, not through a concept. Replace the page rules with these; the content-first, build and look steps still apply.

## Start from the questions

List the questions the user brings to this screen, in priority order ("is today covered?", "what is lapsing?"). The first question gets the top-left of the screen and the largest type; each later question gets its own region. A region that answers no question is removed.

Compute the answers from the data, not by eye: totals, coverage, gaps, overdue items. Check the arithmetic against the data file and state any rule you had to infer (for example, one person fills one role per shift).

## Shell and density

- A quiet shell: a plain sidebar or top bar with the product name and a few sections, a clear screen title, and the current context (date, station, account).
- Neutral ground (not navy, not violet), one surface step or one hairline between regions. Borders, small labels and repeated panels are normal here, unlike on a page.
- Dense but breathable: 14–16px body, 8px spacing rhythm, aligned columns.

## Numbers, status and charts

- Right-align numbers, use tabular figures, show units, and make totals add up.
- Status uses text plus colour (and a shape or icon if helpful), never colour alone. Red for what needs action now, amber for soon, otherwise neutral; colour is spent on data and status, not decoration.
- One chart per question, one series where possible, few gridlines, direct labels instead of legends. No chart is better than a decorative one.
- Dates in one format the user reads naturally; relative time ("in 2 days") beside absolute where urgency matters.

## Phone

The navigation folds away; regions stack in question order; wide tables become lists of rows with the key value first, or scroll inside their own region, never the whole page.

## Tells to remove

Icons in tinted squares, gradient or glowing cards, rainbow chart series, vanity metric tiles with invented percentages, placeholder names ("John Doe"), fake sparklines, and dumped JSON.
