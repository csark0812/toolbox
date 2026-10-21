/** What one line of an order costs, in pence. */
export const lineTotal = (item, prices) => prices[item.product] * item.qty

/** What a whole order costs, in pence. */
export const orderTotal = (order, prices) =>
  order.items.reduce((sum, item) => sum + lineTotal(item, prices), 0)

/** Pence as pounds for the till slip. */
export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
