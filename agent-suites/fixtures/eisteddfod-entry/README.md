# Eisteddfod entry form

The online entry form for Eisteddfod Cwm Teifi. A static page: open `index.html` in a browser. `app.js` switches the form between English and Welsh (the buttons in the header) and shows the error messages when you press Send with a required field empty. Styles are in `styles.css`. The words in both languages come from the translators in `app.js` and the markup from the festival's website, so neither should change: layout fixes go in `styles.css`.

## How the form should look

- On screens wider than 600px each label sits to the left of its field. On a phone the label sits above its field.
- Labels, hints, error messages and button text always show in full, in either language. Long labels wrap onto more lines; they are never cut off or shortened with "…".
- Buttons grow to fit their words. When there isn't room for both on one line, they go onto two lines rather than running off the form.
- An error message sits under its own field and pushes the rest of the form down. It never covers another field, label or hint.
- Nothing overlaps and the page never scrolls sideways, at any width from 320px up.
- The English form has been signed off as it is, so in English, before anything is typed or sent, it should look exactly as it does now at desktop and phone widths.

`npm test` checks the stylesheet parses and that every Welsh string has an English one.
