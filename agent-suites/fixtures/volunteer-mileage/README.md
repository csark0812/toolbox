# Volunteer mileage

Mileage claims for the Wheal Rose community car scheme. Volunteer drivers take people to hospital and GP appointments in their own cars, and the scheme pays them for the miles.

`data/drivers.csv` lists the drivers. `data/trips.csv` has one row per booked trip: the driver, the date, the round-trip miles and the status. A trip that went ahead is `done`; the booking app the office started using on 1 August writes `completed` instead, and the two mean the same thing. A `cancelled` trip is not paid.

Drivers are paid at the HMRC approved mileage rates, so none of it is taxable for them: 45p a mile for the first 10,000 miles a driver does for the scheme in the tax year, and 25p a mile for every mile after that. The tax year runs from 6 April to 5 April. A month that takes a driver past 10,000 miles is paid at 45p up to the 10,000th mile and at 25p after it.

Drivers are paid once a month, for the trips they did that month. `npm run payout -- <month>` prints what each driver is owed for that month.

## Usage

```
npm run payout -- 2026-09   # what each driver is owed for September
npm test
```
