# Recipe cards

The weeknight recipes page for Ada's Kitchen. A static page: open `index.html` in a browser.

The same recipe card is used in the main list and in the "More from Ada" sidebar, and it is also embedded on partner sites at whatever width they give it, so a card lays itself out from its own width, never the screen's:

- A card at least 24rem wide shows its photo on the left, taking two fifths of the card, beside the text. A narrower card stacks a 4:3 photo above the text.
- Card titles scale with the card's width, from 1.1rem on an 18rem card up to 1.6rem on a 36rem card, and stay within those sizes on smaller and larger cards.

Styles are in `styles.css`, with the tokens at the top. The photos are colour placeholders until the shoot is done.

`npm test` checks the stylesheet parses and the page lists every recipe.
