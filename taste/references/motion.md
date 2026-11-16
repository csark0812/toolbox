# Motion

<!-- source-of-truth: taste motion rules: when to animate, timing, easing, choreography, scroll entrances, control feedback, reduced motion. -->
<!-- doc-meta: owner=eng -->

Motion explains change: where something came from, what responded to the visitor, what is now in front. A page that is still is fine; a page whose motion delays reading is not. Build motion last, on a page that already works without it. These rules govern the working parts of a page; a showcase's one showpiece is choreographed by [showpiece](showpiece.md) inside its own region, and these rules hold everywhere around it.

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
- **The brand mark's entrance is the exception.** A wordmark that types or draws itself in may take 1–1.5s (for example 60–80ms between letters, about 650ms per letter), on its own token, because it is the event of the first screen rather than a delay before it.
- **Tune by small steps.** When the user says faster or slower, change the speed by at most 2× per step, or offer 0.75×, 1× and 1.5× as switches on the real page. A jump from too fast to seven times slower lands on too slow.

## Easing

- Things arriving decelerate: fast at first, settling at the end (`cubic-bezier(0.2, 0, 0, 1)` or `ease-out`).
- Things leaving accelerate away (`cubic-bezier(0.4, 0, 1, 1)` or `ease-in`).
- Things moving from one place to another on screen ease in and out (`cubic-bezier(0.4, 0, 0.2, 1)`).
- Linear only for continuous motion such as a progress bar or a slow drift. No bounce or overshoot in the layout of a working screen; a mark appearing (a selected dot, its ring) may grow slightly past its size and settle, and a playful subject may earn a little on one element.
- Keep the curves and durations as custom properties (`--ease-out`, `--dur-quick: 140ms`, `--dur-move: 320ms`) so every element moves in the same voice.

## Choreography

- **The first screen is readable from the first frame.** The headline and the primary action are there at first paint; at most they settle a few pixels. Secondary pieces (the supporting line, the picture, the details) may follow.
- **One lead, then the rest.** Order the entrance by reading order: headline, supporting line, action, picture. Stagger 40–80ms between items and keep the whole sequence under about 600ms, so by the time someone has read the headline everything is still.
- **Small travel.** Rise 8–24px with a fade. Secondary items may start from opacity 0, but only under the `.js` class (see Scroll entrances); the headline never starts hidden. Large slides and zooms draw the eye away from the words.
- **Animate `transform` and `opacity` only.** Animating width, height, top or margins causes jank and moves the layout under the reader.
- **No layout jumps.** Reserve space for what will appear (an error message, a changing total) so nothing below it shifts. Server-rendered and hydrated pages render the same first frame, or the page is rebuilt under the visitor.

## Handoff

When a lead element (the wordmark, the headline) has an entrance, the next large thing (a map, a figure, a showpiece) waits until the lead has finished, then starts 150–250ms later. Read the end from the lead's own animations (`Promise.all(el.getAnimations().map((a) => a.finished))`), not from a guessed delay, so retuning the lead moves everything after it. A stagger is for siblings of equal weight; a lead and a showpiece starting together compete, and neither lands.

## Chains

For a sequence that spreads (lines drawing from node to node, a cascade through a list):

- A segment's duration follows its length, so the travelling point moves at one speed; ease only the two ends of the whole chain.
- A step starts when the segment that causes it arrives, never on a fixed beat.
- Nothing appears as a batch at the end; each part fades back on its own clock.
- Keep the timing in one pure module with its own tests ("no segment leaves before it is reached"), apart from the drawing.

## Continuity

- Anything computed every frame (a curve's bow, a label's side, a camera's target) changes smoothly with its inputs. A value that can flip sides gets hysteresis, and a new selection waits about 100ms before it moves anything.
- Parts that belong together share one timeline: a dot and its ring, a card and its height, a title and the row it came from.
- One smoothing constant per kind of move. When zoom glides at one pace, moving from one item to another uses the same pace.
- In-flight parts keep their resting weight, size and colour; a mark that gets bolder or brighter while it moves reads as a flash.

## Reverse

Every transition the visitor can undo plays back along the same path, at about two thirds of the time: Back from a form returns the page the way it came, a panel that grew shrinks the same way, a list that grew and shrank grows again. Check A → B → A, not only A → B. A loading screen, a blank frame or an element rebuilt during the way back is a failure, not a detail.

## Checking motion

A still screenshot cannot show any of this. On a running app or a local page, run `node <skill>/scripts/motion-probe.mjs <url> --lead <selector>`: it records the tracked elements on every frame and reports one-frame jumps, a page rebuilt under the visitor, a showpiece that starts before the lead settles, layout shift, and slow frames at four times slower CPU. Add `--roundtrip <selector>` for a way in and back, or `--steps steps.json` for a click sequence. When the user sends a screen recording, turn it into timestamped frames with `motion-probe.mjs frames <video>` and read them before replying. Report measured times ("the period lands at 1.3s; the map starts at 1.5s"), not adjectives.

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
