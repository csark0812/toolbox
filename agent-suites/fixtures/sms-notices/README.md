# SMS notices

Text messages for our parcel lockers. `data/templates.json` holds the message templates; `{name}`-style placeholders are filled from `key=value` arguments.

`npm run notice -- <template> key=value ...` prints the message as it will be sent, and warns about characters the cheap GSM alphabet cannot carry (those switch the whole message to UCS-2). `src/charset.mjs` has the GSM 03.38 tables. `npm test` runs the tests.
