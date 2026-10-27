# Vintage rally entries

The entries page for the Hafren Vintage Rally. A static page: open `index.html` in a browser. `app.js` opens the Classes dropdown and the entry form. Our styles are in `styles.css`. `map.css` is the map library's own stylesheet and gets replaced whenever the library is updated, so don't edit it. The markup comes out of the society's website builder, so changes go in `styles.css`.

## How it should behave

- The header stays at the top of the window while you scroll, above everything on the page, map included.
- The Classes dropdown opens below its button on top of everything under it, and every link in it can be seen and clicked.
- Hovering over a Concours badge (or tabbing to it) shows its note in full, on top of the cards around it.
- "Enter your vehicle" opens the entry form in a dialog centred in the window. The dark backdrop covers the whole window, header and map included, wherever you have scrolled to, and the form's fields and buttons can all be clicked.
- The entries keep their little rise as the page loads.
- Apart from that, the page looks the way it does now at desktop and phone widths.

`npm test` checks the stylesheet parses and the markup has every entry.
