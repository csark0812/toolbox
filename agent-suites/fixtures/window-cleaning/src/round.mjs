import { addDays } from './dates.mjs'

/** The date a customer is next due, from their most recent clean. */
export function nextDue(customer, cleans) {
  const last = cleans
    .filter((clean) => clean.customer === customer.id)
    .map((clean) => clean.date)
    .sort()
    .at(-1)
  return addDays(last, customer.every * 7)
}

/** Customers due in the week starting on a Monday, in the order they fall due. */
export function round(customers, cleans, monday) {
  const sunday = addDays(monday, 6)
  return customers
    .map((customer) => ({ ...customer, due: nextDue(customer, cleans) }))
    .filter((customer) => customer.due > monday && customer.due <= sunday)
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id))
}
