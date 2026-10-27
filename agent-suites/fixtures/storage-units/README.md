# Storage units

Tenancies at Wharf Lane Self Storage. `data/units.json` has every let unit: the tenant, the monthly rent in pence, the day of the month the rent is due (`dueDay`, 1 to 31), and `firstUnpaid`, the due date of the earliest month the tenant hasn't paid yet (`null` when they're paid up). Rent is collected by hand at the office, so the list is updated whenever someone pays.

## Usage

```
npm run units   # every unit
npm test
```
