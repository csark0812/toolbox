# Tennis courts

Court bookings for Elm Park Lawn Tennis Club. Members send booking requests through the office, which exports them to `data/requests.json`. `data/members.csv` is the membership list, exported from the office spreadsheet.

A request is booked when the member code is valid (an `M` and four digits), the member is on the list and their membership has not expired by the day of the booking, the court is 1 to 4, and nobody already has that court at that hour. Otherwise it is refused with the reason.

## Usage

```
npm run import               # books every request in data/requests.json, in order
npm run member -- M1002      # shows one member's record
npm test
```
