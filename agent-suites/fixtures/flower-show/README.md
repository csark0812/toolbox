# Flower show

The page for the Walton St Mary's Flower and Produce Show: the show classes, how to enter, last year's results and our sponsors. A static page: open `index.html` in a browser. Styles are in `styles.css`, with the tokens at the top.

Most visitors read it on a phone at the show, so it has to work from 320px wide upwards. The results table is too wide for a phone: it scrolls sideways inside its own box there, rather than squashing, and nothing else on the page scrolls sideways. The committee signs off the layout on a laptop, so the page at 1024px and wider is the reference and should not change without asking.

`npm test` checks the stylesheet parses and the markup lists every class.
