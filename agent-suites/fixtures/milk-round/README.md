# Milk round

The Hillside Dairy round. `data/customers.json` lists the customers in the order the float visits them: name, address, how many pints they take and the days they want them (`Mon` to `Sun`). `away` lists the dates a customer has asked us to stop, first and last day included. `data/closed.json` lists the days the dairy doesn't go out.

## Usage

```
npm run customers   # every customer, in round order
npm test
```
