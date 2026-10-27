# Deli basket

The till script for Marrow & Rye, a small deli. `data/basket.json` is the current basket, with each item's price in pence. Members of the supper club get 10% off.

## Usage

```
npm run receipt               # the receipt for the current basket
npm run receipt -- --member   # with the member price
npm test
```
