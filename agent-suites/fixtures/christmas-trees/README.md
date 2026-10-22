# Christmas trees

Holly Bottom Christmas Tree Farm's pre-order invoices. Customers walk the rows in November, choose a tree, and the tagger ties a numbered tag on it and records the height. `data/tags.json` has every tagged tree: the customer, the tag, the height, whether we deliver it, and how the height was recorded (`office` for the paper tag cards typed up in the office, `app` for the tagging app on the field phone, which we started using this season).

Heights are measured in centimetres for pricing. The price bands:

| Height                                  | Tree price |
| --------------------------------------- | ---------- |
| up to and including 150 cm              | £30.00     |
| over 150 cm, up to and including 180 cm | £42.00     |
| over 180 cm                             | £55.00     |

Delivery is £8.00 on top. Invoices are sent at the end of November and the trees are cut and collected in December.

```
npm run invoices   # every tagged tree: its height in cm, tree price, delivery and total
npm test
```
