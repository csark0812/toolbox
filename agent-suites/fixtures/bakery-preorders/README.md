# Bakery pre-orders

Christmas pre-orders for Crumb & Co. Customers order online for collection on a given day and time. `data/orders.json` is the export from the order form: when a customer edits an order the form appends the new version with the same id and a higher `revision`, so only the latest revision of each order is current.

`npm run bake -- <YYYY-MM-DD>` prints how many of each product to bake for that day's collections. `npm test` runs the tests.
