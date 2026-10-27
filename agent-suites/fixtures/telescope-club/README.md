# Telescope club

Telescope bookings for the Ridgeway Telescope Club's 2025–26 observing season.

- `data/members.csv` lists each member, whether they are an adult or junior, and the date their membership expires. A membership is valid up to and including its expiry date.
- `data/bookings.csv` lists every telescope booking. Cancelled bookings are not charged.

Members pay £6 a night (juniors £3). Anyone else pays the visitor rate of £14 (juniors £7).

## Usage

```
npm run charges   # total charged for the season
npm test
```
