# Quayside Framing: price calculator

We are a small framing workshop. People email us a size and ask "how much?", and we spend half the morning replying. We want a calculator on the website that gives them the real price, the way we work it out at the counter, so they can play with options before they come in. It will be used on phones as much as desktops.

## Options

- **Artwork width** and **artwork height**, in whole centimetres, each from 10 to 120.
- **Moulding** (pick one): Oak £28 per metre, Walnut £36 per metre, Black ash £22 per metre, Gilt £44 per metre.
- **Glazing** (pick one): Standard glass £40 per m², Anti-reflective glass £95 per m², Acrylic £60 per m².
- **Mount**: yes or no. A mount adds a 5 cm border on every side.

## How we price it

1. Outer size = artwork size, plus 5 cm on each side if there is a mount (so a mount adds 10 cm to the width and 10 cm to the height).
2. Moulding = outer perimeter in metres × the moulding's price per metre.
3. Glazing = outer area in m² × the glazing's price per m², but never less than £8.
4. Mount = £12 if chosen.
5. Fitting = £15 on every frame.
6. Large frame surcharge = £20 if either outer side is more than 100 cm.
7. Total = all of the above, to the penny.

Ready in 7 days, or 14 days for Gilt (we gild by hand).

## What the calculator should do

- Show the total, the outer size, the ready time, and a line-by-line breakdown so the customer can see where the money goes.
- Update as options change.
- If a size is outside 10–120 cm, say so next to the field and don't show a price for a size we can't make.
- A "Book a fitting" link to `mailto:hello@quaysideframing.example` with the chosen options in the subject would be lovely.

Plain HTML, CSS and JavaScript; no build step.
