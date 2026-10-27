# Direction

<!-- source-of-truth: taste direction detail: type, colour, layout, imagery and generic tells. -->
<!-- doc-meta: owner=eng -->

The short rules in the skill, with the reasoning behind them. A project's brand and design system win over every line here.

## Type

- **Scale with intent.** Pick a ratio and use few steps: a display size for the one headline, a section size, body, small. On desktop a display headline of 64–120px is normal for a page; on a phone, 36–56px. The gap between display and body is what makes a page look designed rather than typed.
- **One family is usually enough.** A second only for a clear job (display serif over a text sans). Never a third. Monospace only for real code, IDs or tabular data on app screens.
- **Set it properly.** Line length 45–75 characters for running text; line height about 1.5 for body and 1.0–1.15 for display; tighter letter spacing on large display type; tabular figures wherever numbers line up (`font-variant-numeric: tabular-nums`).
- **Fonts that load.** A web font is linked with `display=swap` and followed by a fallback stack of similar width, so the layout survives without it. Check that the font actually rendered in the screenshots.

## Colour

- **Proportion before hue.** One ground covering most of the page, one ink, one accent used for actions and the few things that matter, and optionally one or two whole fields of colour for rhythm. How much of each colour appears matters as much as which colours they are.
- **From the subject.** The harbour's paint, the bakery's flour and crust, the estuary's green and mud: a subject with colours of its own should get them. A fixed brand palette is mapped onto the same roles, not supplemented.
- **Contrast.** Text 4.5:1 against its ground (3:1 for type 24px, or 18.7px bold, and larger). Colour is never the only signal for a state.
- **Defaults to avoid:** violet, indigo or neon on near-black; purple-to-pink gradients; cream ground with terracotta and sage; every section on a different pastel.

## Layout

- **One frame.** Equal outer margins at every width, one content grid, sections aligned to it. Asymmetry happens inside the grid, never as a page pushed to one side.
- **One dominant thing per screen.** A headline set large, a picture, a table, a figure. If two things compete, shrink one.
- **Vary the sections.** Neighbouring sections do not share a layout. A list can be a table, a timeline, a menu, a board, a map; it rarely needs to be a row of cards.
- **No empty stretches.** Empty space is fine only when content anchors it on both sides. One deliberate rest per page at most.
- **Phone is its own composition.** Reorder, stack and resize for a thumb; do not just shrink the desktop. Navigation folds away; the primary action stays reachable.

## Imagery

- Use the project's own pictures large and with intent.
- With none, draw from the subject in CSS or SVG in one consistent flat language using the palette's real colours: the route of the ferry, the street plan, the loaf's scoring pattern, a ticket, a label. For software, build a real, working fragment of its interface with real-looking data that adds up.
- A found or drawn picture never pretends to be the client's own product, room, dish or team.
- No stock-illustration people, gradient blobs, decorative shapes, emoji as icons, or icons in tinted squares.

## Generic tells to remove

Each of these marks a page as unconsidered. Remove it and put a decision in its place.

| Tell                                                           | Instead                                                     |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| Small uppercase letter-spaced label ("eyebrow") over a heading | Fold it into the heading text, or remove it                 |
| Pill badge or "New ·" chip above the headline                  | The news in the headline or the first sentence              |
| Gradient text, gradient buttons, gradient backgrounds          | Flat colour; a real picture                                 |
| Glow and soft drop shadows on things at rest                   | A step in surface tone; shadows only on what floats         |
| Frosted-glass sticky nav                                       | A plain bar: name, a few links, one action                  |
| Three identical icon-topped cards                              | The section's own form: a list, a table, a menu, a sequence |
| Everything centred                                             | Left-aligned text on a grid; centre only the rare statement |
| Styled accent word in the headline (italic, colour)            | The words carry the emphasis                                |
| 01 / 02 / 03 index numbers, thin divider rules everywhere      | Order by position and size; space and tone between sections |
| Invented testimonials, logos, user counts                      | Real proof, or none                                         |
