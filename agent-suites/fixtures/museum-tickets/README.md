# Museum tickets

Timed-entry tickets for the Ice Age gallery at the Calder Street Museum. Visitors enter in half-hour slots from 10:00 to 16:30, and the gallery takes 40 people per slot.

`data/tickets.csv` is the ticket export (reference, date, slot, ticket type, quantity, channel, status). Tickets are sold online and at the front desk; the desk till writes its own rows into the same export.

Every adult, child, concession and member ticket takes a place in its slot. Infants (under 2) go free and do not take a place. A refunded ticket frees its places.

`npm run slots` lists the slots of a day with the places taken and marks a slot `FULL` once 40 places are taken, so the desk knows to stop selling it.

## Usage

```
npm run slots -- 2026-11-07   # places taken in each slot of a day
npm test
```
