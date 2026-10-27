# Range

<!-- source-of-truth: taste registers: the distinct kinds of page taste can build, when each is earned, how to build it and how it fails. -->
<!-- doc-meta: owner=eng -->

The rules in the skill describe one register: the full, poster-like page. Real sites reach much further. Each register below is a different answer to "what is this page?", with the particular that earns it, how to build it, and the way it usually fails. Pick one on purpose; never drift into the poster because it is the default.

## The test for every register

- **Thesis first.** In five seconds a stranger can say who or what this is and what it stands for, without clicking, dragging or scrolling. A person's first screen states a claim in their own voice ("I design products you feel something about"), not a job title.
- **Purpose.** Every metaphor, effect and interaction answers "what is the point of what I'm looking at?" by showing something true about the subject. If the honest answer is "it looks cool", cut it.
- **One signature.** One metaphor, one texture, one toy per page. A second idea gets a single section at most, never the first screen.
- **Emphasis tells the eye where to go.** Mark the three to five facts that matter (a number, a name, a result) so a skimmer reads only those and still gets the point.
- **No wall of text.** A screen of running prose needs a way in: highlights, a short summary, an outline, or a reader view. About 120 words per screen before a break.
- **Room to breathe.** Controls at 44px on a phone, real gutters, nothing squeezed to fit a concept.
- **Personal, not private.** Share what explains the work and the way the person thinks; leave the rest.

## Registers

### Poster

Each screen a composed poster: large type, one dominant thing, sections in different forms. The skill's own rules. **Earned by** a place, product or service with strong material of its own. **Fails as** a tidy grid of work thumbnails with no claim above it: correct and forgettable.

### Quiet column

One narrow column (520–680px), a name, a one-line thesis, short lists of work and roles, generous space, almost no imagery. The design is the editing: what is highlighted. **Earned by** a person whose results speak (users, revenue, shipped things). **Build:** body 16–18px, line length 60–70 characters; mark the key facts with a highlighter band (`<mark>` with a flat accent field behind the text, or a heavier weight and the ink colour against muted text); small, exact hover states on links. **Relaxes** fullness: empty space is the frame here, anchored by the column. **Fails as** bland when nothing is marked, noisy when everything is, and fussy when drawn ornaments sit beside the text.

### Desktop

The page is a computer: a menu bar, icons, windows that open, move and stack, a dock. **Earned by** a person whose work and tools live on screen, when each window holds something real (a project as a file, tools in the dock, a note that is the bio). **Build:** the thesis sits in a window already open on load; icons are buttons with labels; windows are `<section>` or `<dialog>` positioned on a desktop of 1024px or wider, dragged with pointer events, clamped to the viewport, raised on focus, closed with Escape, focus moved into them on open. On a phone the desktop becomes a home screen or a plain list; never tiny windows. **Fails as** a toy desktop to click around with nothing at the end of the click, or one whose chrome outweighs its content.

### Borrowed document

The site wears a document the subject really produces: a PDF in a viewer, a research paper (abstract, figures, references), a spec sheet, a receipt, a changelog. **Earned when** that form is the person's own medium: an academic's paper, a studio's proposal. **Build:** the viewer chrome is real controls (an outline that jumps, a page counter that follows the scroll, fit-width), never a picture of controls; figures are live where they can be. Offer a reader view that drops the chrome to a single text column, and remember the choice. **Fails as** a wall of text: the document's density copied whole. Keep the form, cut the copy to about a screen per page.

### Story

The page is told in order, in big editorial type: chapters by year or place, a few lines of display type each, photographs in clusters, the person's own voice. **Earned by** a life or career whose arc is the point. **Build:** display 96–200px with line breaks set by hand; each chapter briefly pinned (`position: sticky`) while its photos pass; a chapter index and a link straight to the work; real alt text. **Fails as** a diary (too much private life), too much at once (every chapter shouting), or the stock editorial look: a centred serif headline over grey small text and rounded cards, which reads as machine-made.

### Illustrated world

A drawn scene the visitor explores (a room, a desk, a street, a map), where each drawn object leads somewhere real. **Earned when** the person draws, or the scene is truly theirs. **Build:** one SVG in one line weight and three or four colours; hit areas of at least 44px; labels on hover and always visible on focus and on a phone; the same links repeated as a plain text index. **Relaxes** the flat-drawing rule in [direction](direction.md): a hand-drawn language is fine if it is one language. **Fails as** too many objects to read, a drawing style foreign to the person (a paper-craft look on an engineer's site), or decoration with no destination.

### Texture

The surface carries the mood: dither, halftone, grain, risograph overprint, a CRT scanline. **Earned when** the medium is the person's (print, photography, games, hardware). **Build:** texture on images or one field of colour, never under body text; one texture per page; ordered (Bayer) dithering of a picture in a canvas or a pre-rendered PNG with `image-rendering: pixelated`; grain as a small tiled image at low opacity; still images with reduced motion. A gradient may be the input to a dither, never shown smooth. Text keeps 4.5:1 contrast. **Fails as** overboard: everything dithered, hard to look at, the effect louder than the work.

### Toy

One object to play with: a ticket that prints, a curtain that follows the cursor, a small game, a pile of things to throw. **Earned only when** the toy demonstrates the thesis: an interaction designer's site whose toy is their craft. **Build:** on the first screen beside a thesis readable without touching it, or as the reward at the end; a short label says what it is for unless that is obvious; works with touch and keyboard; still with reduced motion. User-driven physical motion (springs with damping, `requestAnimationFrame`, transforms only) may run past the skill's duration caps. **Fails as** a gimmick, as several unrelated experiments thrown together, or as a cramped interface built around the toy.

## Choosing and offering

Start from the particular, not the register: a person whose work is on screen leans desktop; an academic leans document; a designer with a strong voice leans story; an engineer with numbers leans quiet column; someone who draws leans illustrated. Name the particular in the idea sentence; if it only justifies the register by being "creative", pick another.

When offering several directions, take each from a different register, at least two apart in this list, so they differ in idea and not just colour. Mixing is allowed after a pick ("quiet column with the story's first screen"), one register leading.
