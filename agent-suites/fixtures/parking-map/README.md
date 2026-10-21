# Parking map

The car park finder for Harbourside Parking. A static page: open `index.html` in a browser. `app.js` opens a car park's popup when you tap its pin, opens the pay dialog from the popup, and shows search suggestions while you type in the header.

How the layers are meant to stack, from the top:

1. The pay dialog and its dimmed backdrop, over the whole page.
2. The sticky header, with its search suggestions.
3. The map: an open popup, then the zoom buttons and legend, then the pins, then the tiles.

Styles are in `styles.css`, with the tokens at the top. The map tiles are panned with a transform on `.map__tiles`.

`npm test` checks the stylesheet parses and the markup lists every car park.
