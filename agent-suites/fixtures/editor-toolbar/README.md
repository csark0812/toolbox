# Editor toolbar

The document editor's chrome. `index.html` shows the toolbar and the dialog footer. Buttons come from the shared button component: `btn` is the base class and `btn-danger` the destructive variant. The component generates the markup, so keep those class names. Styles are in `styles/` and load in the order `index.html` lists them. `npm test` checks the stylesheets parse.
