# Woodshop slots

The booking page for the big lathe at the Ferncombe Community Woodshop. A static page: open `index.html` in a browser. `app.js` handles the theme toggle and picking a slot. Styles are in `styles.css`, with the tokens for the light and dark themes at the top.

The page has a light and a dark theme. The dark theme comes from the system setting, or from the toggle in the header, which wins over the system setting either way. The dark theme should look the same whichever way it was turned on.

Several of our members can't use a mouse, so everything on the page can be used from the keyboard, and whatever has keyboard focus shows a clear focus ring in either theme (WCAG 2.2 focus appearance: a ring at least 2px thick all the way round, at least 3:1 against what is next to it).

`npm test` checks the stylesheet parses and the markup has every slot.
