# Mountain hut

Bookings for the Coire Bàn mountain hut, which has 20 bunks. `data/bookings.csv` is the season's booking sheet (reference, party name, arrival date, nights, guests, status).

A booking covers the nights it sleeps at the hut: a party arriving on 13 August for 2 nights sleeps there on the nights of 13 and 14 August and leaves on the morning of the 15th. A cancelled booking frees its bunks.

`npm run nights` lists every night of a month with the bunks taken and marks a night `OVER` when more guests are booked in than there are bunks, so the warden can ring a party before they walk in.

## Usage

```
npm run nights -- 2026-08   # bunks taken each night of a month
npm test
```
