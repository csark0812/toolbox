# Range

<!-- source-of-truth: taste range: composable ideas a page can draw on beyond the poster, what each is, where it fits, how to build it and when it is overdone. -->
<!-- doc-meta: owner=eng -->

The rules in the skill describe one way to build a page: full, poster-like screens. Real sites reach much further, by combining a few ideas, each placed where it does a job. This is a palette of those ideas, not a menu of page types. Each says what kind of thing it is, where it belongs, how to build it and when it is too much. Choose the few your subject earns and put each in its place.

## The test for every combination

- **Utility first.** The page does its job before anything else: the reader finds what they came for and can act on it. An idea that gets in the way of that goes, however good it looks.
- **Thesis first.** In five seconds a stranger can say who or what this is and what it stands for, without clicking, dragging or scrolling. A person's first screen states a claim in their own voice ("I design products you feel something about"), not a job title.
- **Purpose.** Every metaphor, effect and interaction answers "what is the point of what I'm looking at?" by showing something true about the subject. If the honest answer is "it looks cool", cut it.
- **One showpiece per view.** A toy, a texture, a metaphor: at most one competes for attention on any screen. Feedback and quiet entrances are not showpieces, but rolling digits beside a draggable toy, or an automatic nudge that performs the toy for the visitor, are a second one.
- **Emphasis tells the eye where to go.** Mark the three to five facts that matter (a number, a name, a result) so a skimmer reads only those and still gets the point.
- **No wall of text.** A screen of running prose needs a way in: highlights, a short summary, an outline, or a reader view. About 120 words per screen before a break.
- **Room to breathe.** Controls at 44px on a phone, real gutters, nothing squeezed to fit a concept.
- **Personal, not private.** Share what explains the work and the way the person thinks; leave the rest.

## Structure: how the page is held together

**Poster screens.** Each screen composed as a poster: large type, one dominant thing, neighbouring sections in different forms. _Use it_ where there is strong material to show (a place, a product, a body of work with pictures). The skill's own rules. _Overdone_ as a tidy grid of thumbnails with no claim above it.

**Quiet column.** One narrow column (520–680px), short lists, generous space, almost no imagery; the design is the editing. _Use it_ where the facts speak for themselves (roles, results, writing), and as the calm ground other ideas sit on. Body 16–18px, 60–70 characters a line; the space is anchored by the column, so the fullness rule does not apply to it. _Overdone_ when nothing is marked and it reads as a plain document.

**Chapters in time.** The content told in order, by year or place, each chapter a few lines of large type with its pictures. _Use it_ where an arc explains the person or the work: a career, a project's making, a company's history; often one section rather than the whole page. Pin each chapter briefly (`position: sticky`) while its pictures pass, give a chapter index and a link straight to the work. _Overdone_ as a diary, or as every chapter shouting at the same size.

**Windows.** Content in windows that open, move and stack, with icons and a menu bar or dock. _Use it_ where the work and tools live on a computer and each window can hold something real: a project as a file, the bio as a note, tools in a dock. Can be the whole first screen or one section. The thesis sits in a window already open; icons are labelled buttons; windows are `<section>` or `<dialog>`, dragged with pointer events, clamped to the viewport, raised on focus, closed with Escape. On a phone they become a list or a home screen, never tiny windows. _Overdone_ as clicking around with nothing at the end of the click.

**A borrowed document.** The page or a part of it wears a document the subject really produces: a PDF in a viewer, a paper with abstract and figures, a spec sheet, a receipt, a changelog. _Use it_ where that form is the subject's own medium, for the part it suits: the CV as a PDF, the research as a paper, the pricing as a proposal. Viewer chrome is real controls (an outline that jumps, a page counter that follows the scroll), never a picture of controls. _Overdone_ when the document's density comes along whole; keep the form, cut the copy.

## Emphasis: where the eye goes

**Highlight marks.** A flat band of the accent behind the three to five facts that matter, or those facts in the ink against muted text. _Use it_ wherever there is running text or a list a skimmer will scan: a bio, a results list, project lines. `<mark>` styled as a flat field, no rounded pill. _Overdone_ when more than one fact in a sentence is marked.

**Display type set by hand.** A statement at 96–200px with its line breaks chosen, not wrapped. _Use it_ for the thesis, and for at most one or two other statements that carry the argument. _Overdone_ as the stock editorial look: a centred serif headline over grey small text and rounded cards.

**A reader view.** A control that drops everything to one clean text column, remembered between visits. _Use it_ where there is real reading (essays, a paper, a long case study) next to anything playful or dense. _Overdone_ when there is nothing long enough to need it.

## Material: what the surface is made of

**A drawn scene.** A room, a desk, a street or a map drawn in one SVG, where each object leads somewhere real. _Use it_ where the person draws, or the scene is truly theirs, as the navigation or one section's figure; repeat its links as a plain text index. One line weight, three or four colours, hit areas of at least 44px, labels visible on focus and on a phone. This replaces the flat-drawing rule in [direction](direction.md) only for the scene. _Overdone_ with too many objects, or in a style foreign to the person (paper craft on an engineer's site).

**Drawn accents.** A signature, a hand-drawn divider, an annotation circling one thing. _Use it_ in one or two places where a human mark adds warmth or points at something. _Overdone_ as ornament on every section.

**Surface texture.** Dither, halftone, grain, risograph overprint, scanlines. _Use it_ where the medium is the subject's own (print, photography, games, hardware), on pictures or one field of colour, never under body text. Ordered (Bayer) dithering in a canvas or a pre-rendered PNG with `image-rendering: pixelated`; grain as a small tiled image at low opacity. A gradient may be the input to a dither, never shown smooth. _Overdone_ when everything is textured and the effect is louder than the work.

**Photographs in clusters.** Real pictures grouped by moment, slightly overlapping or in a tight grid, with captions. _Use it_ where the person's own photos explain the work or the life behind it, inside chapters or beside the bio. Never stock, always real alt text. _Overdone_ when the private life outweighs the work.

## Interaction: what the visitor can do

**A toy.** One object to play with: a ticket that prints, a curtain that follows the cursor, a small game, a pile to throw. _Use it_ only where it demonstrates the thesis (an interaction designer's craft), beside a thesis readable without touching it, or as a reward at the end. A short label says what it is for unless that is obvious; it works with touch and keyboard and is still with reduced motion. User-driven physical motion (springs with damping, transforms only) may run past the skill's duration caps. _Overdone_ as several unrelated experiments, or a cramped layout built around it.

**A live fragment of the work.** A small working piece of what the person makes: a component to press, a chart that responds, a few seconds of a product's real flow, built in HTML. _Use it_ inside the work section, one per project at most, where a picture would only describe it. _Overdone_ when the fragment needs instructions.

## Combining and offering

A page is a few of these ideas, each where it does its job: a quiet column with highlight marks for the bio, chapters in time for the career, one toy as the reward at the end; or windows on the first screen, a borrowed PDF for the CV, texture only on the photographs. One idea leads the first screen and the rest take their own sections or elements. They share one palette and one type system, so the page still reads as one voice.

Restraint is not the goal. A showcase needs one idea carried to full craft ([showpiece](showpiece.md)); the quiet around it is what lets it land, and a page that is only quiet reads as generic.

Start from the particulars, not the ideas: what the person makes, their medium, how they talk. Name the particular that earns each idea you use; if the only reason is "creative", drop it.

When offering several directions, give each a different leading idea and a different mix, so they differ in idea and not just colour.
