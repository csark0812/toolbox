# Showpiece

<!-- source-of-truth: taste showpiece craft: when a page needs one moment built to production quality, the techniques for it, the polish that separates it from a sketch, and how to check it. -->
<!-- doc-meta: owner=eng -->

A correct page with one quick trick does not hold up next to the sites people admire. Those sites have one moment built with care (real-time graphics, choreographed motion, refined type, real photography) on a page that otherwise stays quiet so the moment lands. This reference is for building that moment.

## When

- The page is a showcase: a personal site or portfolio, a launch, a studio or brand page, or the user asks for something that wows or names sites they admire.
- Not for working screens, forms and flows: there the rules in the skill and [motion](motion.md) hold everywhere.

Build one showpiece, not several. When offering directions, make two at this level rather than five sketches: breadth of rough options loses to one finished one every time.

## The bar

- **Beside the references.** Put it next to the sites the user named and ask whether it holds up: the type as considered, the motion as smooth, the detail as finished. If not, it is a sketch; keep going.
- **Take their craft level, not their look.** Copying a reference's layout, type or signature moment is rejected as a copy. Borrow how carefully it is made.
- **Still has a point.** The purpose test in [range](range.md) holds: the showpiece shows the thesis (a lens that bends the philosophy line it sits on, the person's real apps running in the hand), never a tech demo beside it.
- **From the person.** Its idea comes from their own words and interests, never from a metaphor of their job title (frames, curves, heatmaps for an engineer read as generic).

## Techniques

Load libraries from a CDN with a pinned version, and keep the page's text in HTML, never only in a canvas.

- **Real-time graphics:** a WebGL fragment shader (raw, or three.js or OGL) for refraction, liquid, noise fields, light; canvas 2D for particles and simple physics. Drive it from the pointer, the scroll or time, with eased inputs, not raw ones.
- **3D:** three.js with built or real geometry, a light rig and soft shadows; a camera that moves with the scroll or the pointer within a small range.
- **Scroll choreography:** a sticky stage whose progress (0–1 through the section) drives transforms in sequence; CSS scroll-driven animations (`animation-timeline: view()`) where supported, or a small scroll-progress script; GSAP ScrollTrigger is fine if the page already uses it.
- **Physics:** springs integrated per frame with velocity carried over from the pointer, so a flick feels thrown; damping tuned by hand.
- **State morphs:** the View Transitions API, or shared-element moves with FLIP, so one view turns into the next instead of cutting.
- **Type as material:** variable font axes (weight, width, optical size) animated with input; text split into lines or letters for staged entrances.
- **SVG filters:** displacement and turbulence for distortion on images or type, sparingly.
- **Photography:** the person's real photos, treated (duotone, cut-out, grain on the photo only) and placed large.

## Polish

- **Hand-tuned timing.** Stage the moment: anticipation, the move, follow-through, a settle. Different durations and curves for different gestures; nothing on the one default ease.
- **Alive at rest.** A slow idle (a drift, a breath) so the first frame is not dead, quiet enough not to distract.
- **Smooth.** 60fps on a laptop: animate transforms and shader uniforms, not layout; cap the device pixel ratio at 2; pause work off-screen with `IntersectionObserver`; lower resolution on a phone.
- **Finished edges.** Type kerned and tracked at display size; the loading sequence designed; cursor, selection colour, focus ring and favicon considered.
- **Robust.** Without WebGL or with reduced motion, a designed still state in its place (a rendered frame, not an empty box); the text and actions never wait for the graphics.

## Checking it

The camera takes still screenshots, which show layout but not motion. For the showpiece, script a few frames: drive the pointer or scroll in a headless browser and screenshot at several moments (for example 0, 300 and 900ms after an interaction), then open them in sequence. Check the frame rate in a performance trace if the browser allows it. If motion could not be checked, say so in the reply.

Spend the passes this needs: after the page is built and its FAILs fixed, keep refining the showpiece until it holds up beside the references, then stop.
