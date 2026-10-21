# Food truck

Orders for the Halloumi & Co. food truck. `data/menu.json` is the menu: each item's name, its price in pence, what kind of item it is (`main`, `side`, `extra` or `drink`) and its allergens. `data/orders.json` lists Saturday's orders at the market: the order number, the customer's name, and each line's item, quantity and any extras added to it.

## Menu board

The menu board lists every item with its price and, in brackets, its allergens.

## Tickets

Each order prints a ticket for the hatch: the order number and name, one line per item with its price, and the total.

## Usage

```
npm run board     # the menu board
npm run tickets   # Saturday's tickets
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `halloumi-and-co/truck`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
