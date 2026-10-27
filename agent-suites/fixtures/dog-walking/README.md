# Dog walking

Walks and invoices for Muddy Paws, a three-walker dog walking business. `data/walks.json` is the walk log (date, dog, minutes, walker) and `data/dogs.json` has each dog's owner.

Walks are charged £12 per half hour, and every started half hour is charged: a 40-minute walk is two half hours.

## Usage

```
npm run walks                 # every walk this month
npm run invoice -- Biscuit    # a dog's invoice
npm test
```
