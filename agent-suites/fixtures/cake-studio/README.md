# Cake studio

Order tools for a two-oven celebration cake studio in Frome. `data/orders.json` holds the booked cakes: the customer, the date, the flavour, the portion style (`wedding` is a 1-inch finger, `party` a 2-inch square; older orders sometimes have none) and the tiers, each a shape and a size in inches. `config/studio.json` has the square inches per portion style, the price per portion for each flavour and the delivery rate.

## Commands

```
npm run quote -- C-301                                  # price a booked order
npm run quote -- --style party --flavour sponge round:10 square:8   # price an enquiry
npm run sheet -- C-301           # the kitchen sheet, laid out by templates/sheet-*.txt
npm run delivery -- C-301        # the delivery note for the van
npm run delivery -- C-301 --json # the same for the courier's app
npm run price-list               # the price list on the website, every size and shape
npm test
```

## Used outside this repo

Brightside Couriers' app runs `npm run delivery -- <ref> --json` and reads the JSON it prints (`ref`, `date`, `tiers`, `servings`, `boxes`, `fragile`). Their app is not ours to change, so that JSON has to stay as it is.
