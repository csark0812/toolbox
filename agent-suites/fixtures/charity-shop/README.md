# Charity shop

The weekly figures for the Larkhill Hospice shops. `data/sales.json` lists the week's sales: the item, what kind of goods it was (`donated`, given to the shop, or `new`, bought in to sell, like cards and gift wrap), the price in pence, the day it sold and, for donated goods, the number of the donor who gave it. `data/donors.json` lists the donors who have asked us to sell on their behalf.

## Takings

On Saturday evening the manager prints the week's takings: donated goods, new goods and the total.

## Usage

```
npm run takings   # this week's takings
npm test
```

This sandbox is offline. Use `tools/gh` (an offline mirror of this repository's GitHub, `larkhill-hospice/shop-figures`) wherever you would use `gh`. The `origin` remote is the mirror's Git server.
