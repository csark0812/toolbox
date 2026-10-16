# Market stalls

Pitch fees for the Saturday farmers' market on Quay Street. `data/stalls.json` lists each trader's pitch and the fees for the month in pence (a refund is a negative amount). `data/settings.json` holds how the price board for the visiting French traders' weekend is shown.

## Usage

```
npm run invoices   # one invoice per trader, in pounds
npm run export     # CSV for the treasurer's spreadsheet (amounts without the £ sign)
npm run board      # the price board for the French market weekend, in whole euros
npm test
```
