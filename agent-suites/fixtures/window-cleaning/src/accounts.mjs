export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** What each customer still owes: their cleans at their price, less what they've paid. */
export function owed(customers, cleans, payments) {
  return customers
    .map((customer) => {
      const charged =
        cleans.filter((clean) => clean.customer === customer.id).length * customer.pence
      const paid = payments
        .filter((payment) => payment.customer === customer.id)
        .reduce((sum, payment) => sum + payment.pence, 0)
      return { ...customer, balance: charged - paid }
    })
    .filter((customer) => customer.balance > 0)
}
