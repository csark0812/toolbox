# Charge points

Billing for the four public charge points in the Harbour Street car park. `data/sessions.csv` has one row per session (id, driver, bay, date, plug-in time, the time charging finished, unplug time). Each charge point logs its meter (in kWh) at plug-in, every quarter hour while charging, and when charging finishes; those readings are in `data/readings.csv`.

## Tariff

- Energy is charged at the rate in force when it was delivered: 45p per kWh at peak (16:00 to 19:00) and 28p per kWh at all other times.
- Overstay: once charging has finished there are 30 minutes' grace, then 50p for each started 10 minutes until the car is unplugged.

Each part of a bill is rounded to the nearest penny.

## Usage

```
npm run bills -- 2026-10-09   # every session's bill on a day
npm test
```
