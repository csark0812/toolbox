# Field service

Plans the day for the boiler repair technicians: who goes to which call-out, in what order, and the texts customers get.

```
npm run visits -- assign       nearest free technician for each open call-out
npm run visits -- route <tech> the technician's stops in order, with travel times
npm run visits -- export       the dispatch sheet as CSV (columns from config/export.json)
npm run visits -- notify <id>  the SMS sent to a customer
```

`npm test` runs the tests.
