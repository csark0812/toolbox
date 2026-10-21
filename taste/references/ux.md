# Hierarchy and UX

<!-- source-of-truth: taste rules for visual hierarchy, actions, forms, states and interactive sections. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-21 -->

Read this whenever the page has something to do: a form, a flow, a calculator, filters, settings, or a data screen. A good-looking screen that is unclear to use loses to a plain one that works.

## Hierarchy

- **Quiet the rest instead of shouting the main thing.** Decide the one most important thing on each screen, then step everything else down: a muted ink for secondary text, a lighter one for meta, normal weight for most text. Size is the last lever, not the first.
- **Few, separated steps.** Choose spacing and type sizes from a short scale whose neighbours are clearly different; two sizes a pixel apart read as a mistake. Two or three text colours and two weights carry most screens.
- **Labels are secondary.** Where the value explains itself ("12 left", "£612 a month", "Closes 30 Oct"), drop the "Label:" prefix. Where a label is needed, it is smaller or quieter than its value.
- **Group with space.** More space between groups than within them; a heading sits closer to what it introduces than to what came before. Prefer space, tone and alignment over borders and boxes.
- **Width with intent.** Text and forms keep a comfortable measure (about 45–75 characters, forms about 30–40em) even on a wide screen; use the spare width for a second column (a summary, help text, a figure) rather than stretching.
- **Phone first for the hard parts.** Big type shrinks more than small type at narrow widths; controls never do.

## Actions

- **One primary action per view,** filled in the accent. Secondary actions are outlined or plain; tertiary ones look like links. Two filled buttons side by side make the visitor choose before they understand.
- **Name actions for their result:** "Place order", "Save changes", "Leave the station", never "Submit" or "OK".
- **Destructive actions** sit apart, look quiet until chosen, and confirm with the consequence spelled out ("This removes your account and your 3 booked slots"). The confirm button names the action.
- **Targets:** at least 24px in both directions everywhere, 44px for anything on a phone that is not a link inside running text, with space between neighbours.

## Forms and flows

- **Ask only what is needed,** one column, labels above fields, fields sized to their content (a postcode is short). Mark the optional ones, not the required ones.
- **Show where they are:** steps named and counted ("Delivery, 3 of 4"), the current one marked, earlier ones reachable without losing anything typed. Never ask twice for what they already gave.
- **Validate kindly:** check a field when the visitor leaves it or presses continue, not on every keystroke. Put the message right under the field, in plain words saying how to fix it ("Enter a postcode like ST3 1PQ"). Mark the field (`aria-invalid="true"`, message linked with `aria-describedby`), move focus to the first problem, and keep what was typed. A summary at the top helps on long forms.
- **Use the right inputs:** `type="email"`, `tel`, `inputmode="numeric"`, `autocomplete` tokens, real radio buttons and checkboxes with labels that are part of the tap target.
- **Say what happens next** before the final button (payment, delivery, emails) and after it.

## States

Every screen that loads, filters, saves or submits has more states than the happy one. Design each as deliberately as the first screen:

- **Empty:** what would be here, why it is empty, and the one action that fills it ("Your cart is empty. Back to the shop"). Hide filters and totals that have nothing to work on.
- **No results:** say nothing matched, repeat the search or filters that caused it, and offer one action that clears them.
- **Loading:** keep the layout's shape so nothing jumps when data arrives.
- **Error:** what went wrong in the visitor's terms and what to do; never only a red border.
- **Unsaved and saved:** a visible note when there are changes not yet saved, and a confirmation after saving that says what was saved.
- **Success:** the confirmation is a page of its own weight: what happened, the reference, where the email went, what comes next.

## Interactive sections

- **Calculators and pricing:** the answer is the dominant thing, updates in place as the visitor changes any input, and is right (check the arithmetic against the data). Inputs sit beside or above the answer, never far below. When another choice would suit them better, say so with the difference.
- **Filters and search:** results update as they type; the count of matches is always visible; active filters are visible and removable one by one; the empty result follows the no-results rule above.
- **Settings:** grouped the way the user thinks about them, each control with a label that says what "on" means, defaults visible, and the dangerous ones at the end and apart.
