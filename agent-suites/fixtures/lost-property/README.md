# Lost property

The lost property API for Kingsbridge Central station. Staff log what is handed in; passengers sign in to search for their things and claim them. `data/items.json` and `data/claim-log.json` hold the office's records. Dates are `YYYY-MM-DD`.

Rules for every endpoint:

- Searching needs a signed-in session (`passengerId` or `staffId`); otherwise it gets 401.
- Passengers only ever see an item's `id`, `title`, `category` and `foundOn`. Its `hiddenMarks` (the details only the owner would know) and the finder's name and phone number are for staff only.
- An item is held for 28 days, counting the day it was found as day 1. From day 29 it goes to the charity shop and can no longer be found or claimed.
- An item is handed over once. A released item has `status: "released"` and `releasedTo`, and stays in `items.json`.
- A claim is only released to a passenger who has described the item's hidden marks.

`src/api.mjs` routes requests to the handlers; `request.body` is the request's JSON body as parsed by `JSON.parse`, and `request.today` is the date the request arrives. `npm test` runs the handler tests.
