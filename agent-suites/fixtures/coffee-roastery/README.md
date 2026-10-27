# Coffee roastery

Wholesale and shop orders for Lantern Coffee Roasters. `data/beans.json` lists the beans in the order they go through the roaster each morning, and `data/orders.json` has every order: the roast date, the customer, whether it's still open, and each line's bean and weight as the customer wrote it (`250g`, `1kg`, `0.5kg`, `1kg 500g`).

## Usage

```
npm run orders   # every order
npm test
```
