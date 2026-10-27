# Motion

<!-- source-of-truth: taste motion rules: when to animate, timing, easing, choreography, scroll entrances, control feedback, reduced motion. -->
<!-- doc-meta: owner=eng -->

Motion explains change: where something came from, what responded to the visitor, what is now in front. A page that is still is fine; a page whose motion delays reading is not. Build motion last, on a page that already works without it.

## When to animate

- **Always:** feedback on every control (hover, press, keyboard focus, selected), and state changes the visitor caused (a step advancing, a total updating, a panel opening, an error appearing).
- **Usually, briefly:** the first screen settling in on load, and sections arriving as they scroll in.
- **Rarely:** anything that loops, moves on its own, or ties to the scroll position. One such move per page at most, and only when it says something about the subject. If it moves by itself for more than 5s (a carousel, a ticker, a looping figure), give it a visible pause control.
- **Never:** motion that hides content until it finishes, moves text while it is being read, or makes the visitor wait to act.

## Timing

- Feedback on a control: 100–150ms. A press should feel instant.
- Small state changes (a toggle, a tooltip, a validation message, a total changing): 150–250ms.
- Larger changes (a panel, a step, a dialog, an entrance): 250–400ms. Past about 500ms motion reads as slowness.
- Exits are quicker than entrances, roughly two thirds of the time: what leaves should get out of the way.
- Distance and size set duration: a small nudge is short, a full-width move takes longer. Do not use one duration for everything.

## Easing

- Things arriving decelerate: fast at first, settling at the end (`cubic-bezier(0.2, 0, 0, 1)` or `ease-out`).
- Things leaving accelerate away (`cubic-bezier(0.4, 0, 1, 1)` or `ease-in`).
- Things moving from one place to another on screen ease in and out (`cubic-bezier(0.4, 0, 0.2, 1)`).
- Linear only for continuous motion such as a progress bar or a slow drift. No bounce or overshoot on a working screen; a playful subject may earn a little on one element.
- Keep the curves and durations as custom properties (`--ease-out`, `--dur-quick: 140ms`, `--dur-move: 320ms`) so every element moves in the same voice.

## Choreography

- **The first screen is readable from the first frame.** The headline and the primary action are there at first paint; at most they settle a few pixels. Secondary pieces (the supporting line, the picture, the details) may follow.
- **One lead, then the rest.** Order the entrance by reading order: headline, supporting line, action, picture. Stagger 40–80ms between items and keep the whole sequence under about 600ms, so by the time someone has read the headline everything is still.
- **Small travel.** Rise 8–24px with a fade. Secondary items may start from opacity 0, but only under the `.js` class (see Scroll entrances); the headline never starts hidden. Large slides and zooms draw the eye away from the words.
- **Animate `transform` and `opacity` only.** Animating width, height, top or margins causes jank and moves the layout under the reader.
- **No layout jumps.** Reserve space for what will appear (an error message, a changing total) so nothing below it shifts.

## Scroll entrances

- Content is visible without the script. Hide it for the entrance only after the script has run and marked the page (for example add a `js` class to `<html>`, and style `.js .reveal` as the start state). A page whose content is `opacity: 0` in plain CSS is blank for anyone whose script fails, and for screenshot tools.
- Trigger early, as the section's top crosses about the bottom tenth of the viewport (`IntersectionObserver` with a negative bottom `rootMargin`), and play once. Content should be settled before it reaches the middle of the screen.
- Animate the parts of a section (heading, then text, then figure), not one fade on the whole block, and keep each under 400ms.
- Long lists, tables, forms and anything the visitor came to work with do not animate in. Neither does anything already in view on load except the first screen.

## Feedback on controls

SKILL.md sets hover, press, focus and selected states and their timing. In addition:

- **Press:** an immediate, smaller change (a darker tone, a 1–2px shift down, or scale to about 0.98).
- **Selected and current:** marked by fill, border or a mark as well as colour.
- **Results:** a brief highlight (200ms) on a value that changed helps the eye find it.

## Reduced motion

Under `@media (prefers-reduced-motion: reduce)`, keep every state change but drop the travel: no transforms, no parallax, no autoplay, no scroll-linked moves. Content appears in its final state at once (or with a fade under 150ms). Do not rely on a near-zero duration hack on an element that starts hidden: set its resting state directly. Test it: the first screen with reduced motion on is complete and still.
