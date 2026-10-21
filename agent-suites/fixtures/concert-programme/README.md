# Concert programme

The online programme for the Elmfield Sinfonia's winter concert. A static page: open `index.html` in a browser.

The page follows the reader's system light or dark setting, and the switch in the header lets them override it. `theme.js` is shared with the box office pages: it sets `data-theme="light"` or `data-theme="dark"` on the `<html>` element, or removes the attribute for "System", and remembers the choice.

Styles are in `styles.css`; colours come from the tokens at the top.

`npm test` checks the stylesheet parses.
