# Skip hire

Bookings and pricing for Avon Skips. A skip goes on a driveway or other private ground, on a verge, or on the road; a skip on the road needs a permit from the council.

- `data/bookings.json` holds the current bookings.
- `data/quote-parts.json` lists the parts of a quote, in the order the office wants them printed.

## Usage

```
npm run quote -- SK-311                                   # quote an existing booking
npm run quote -- --size midi --postcode "BS3 4RT" --placement road --weeks 2
npm run letters                                           # letters for the neighbours
npm run permits                                           # permit applications to send to the councils
npm run reminders -- 2026-10-24                           # permits running out (cron runs this every morning)
npm test
```

The councils' shared permit portal installs this package and calls `needsPermit` and `permitFee` from `skip-hire/hire` to check the fee we quote.
