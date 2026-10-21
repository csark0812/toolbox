# App screens

<!-- source-of-truth: taste rules for screens people work in: dashboards, rotas, queues, settings. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

An app screen is worked in, often all day. It earns its look through clarity, density and correct numbers, not through a concept. Replace the page rules with these; the content-first, build and look steps still apply.

## Start from the questions

List the questions the user brings to this screen, in priority order ("is today covered?", "what is lapsing?"). The first question gets the top-left of the screen and the largest type; each later question gets its own region. A region that answers no question is removed.

- **One-line answer first.** Under the screen title, one sentence answers every question at once ("Covered now. Short on Fri 23 and Sat 24."), so the screen reads in five seconds.
- **Every problem has its next step.** Beside each gap, overdue item or failure, show what fixes it, computed from the data (who could fill the gap, who to chase), with the action as a real button or link. A screen that only reports problems is half a tool.
- **Compute, then check.** Work the answers out from the data, not by eye: totals, coverage, gaps, overdue items. Run the logic once against the data file and compare with your own reading.
- **Ambiguous rules:** when a rule can be read two ways (does "until Friday" include Friday?), choose the reading the rest of the data supports (if the schedule already books that person on Friday, its author expects them), and state it in the reply.

## Shell and density

- A quiet shell: a plain sidebar or top bar with the product name and a few sections, a clear screen title, and the current context (date, station, account). On a phone the sections stay reachable through a menu or a bottom bar.
- Neutral ground (not navy, not violet), one surface step or one hairline between regions. Unlike a marketing page, a work screen may use borders, compact labels and a repeated panel grid.
- Dense but breathable: 14–16px body (secondary text no smaller than 13px), 8px spacing rhythm, aligned columns. Regions sit in a grid with no tall empty area beside or under a short panel.

## Numbers, status and charts

- Right-align numbers, use tabular figures, show units, and make totals add up.
- Status uses text plus colour (and a shape or icon if helpful), never colour alone. Red for what needs action now, amber for soon, otherwise neutral; colour is spent on data and status, not decoration or avatars.
- One chart per question, one series where possible, few gridlines, direct labels instead of legends. No chart is better than a decorative one; a progress bar for days remaining is decoration.
- Dates in one format the user reads naturally; relative time ("in 2 days") beside absolute where urgency matters.

## Phone

The navigation folds away; regions stack in question order; wide tables become lists of rows with the key value first, or scroll inside their own region, never the whole page. Every value keeps its label (which seat is empty, which role is missing).

## Tells to remove

Icons in tinted squares, gradient or glowing cards, rainbow chart series, vanity metric tiles with invented percentages, placeholder names ("John Doe"), fake sparklines, and dumped JSON.
