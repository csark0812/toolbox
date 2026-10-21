# Gallery labels

The online version of the wall labels for the Harrow Lane Gallery's spring hang. A static page: open `index.html` in a browser.

- `styles.css` is ours. It is split into cascade layers (`reset`, `base`, `components`, `utilities`); the colour and type tokens live in `:root` in the `base` layer.
- `hours-widget.css` is the opening-hours embed from Tessera, our ticketing provider. We paste it in unchanged from their dashboard whenever they update it, so local edits to that file get lost.

`npm test` checks the stylesheet parses.
