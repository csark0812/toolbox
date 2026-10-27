# Food bank

Parcel packing for the Kingsway food bank. Referral agencies send households to us; `data/referrals.json` holds this week's referrals with the household's surname, how many people live there, the collection day and the referral's status.

Parcels come in three sizes: small for one or two people, medium for three or four, and large for five or more.

Households collect on their day between 10:00 and 12:00.

## Usage

```
npm run packing -- Tue   # the packing list for a collection day
npm run report           # parcels packed this week, by size
npm test
```
