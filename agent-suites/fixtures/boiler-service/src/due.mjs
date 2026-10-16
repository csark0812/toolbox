import { aYearAfter } from './util.mjs'

/** Customers whose service falls due in `month` (`YYYY-MM`), earliest first. */
export function dueIn(customers, month) {
  return customers
    .map((customer) => ({ ...customer, due: aYearAfter(customer.lastService) }))
    .filter((customer) => customer.due.startsWith(`${month}-`))
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id))
}
