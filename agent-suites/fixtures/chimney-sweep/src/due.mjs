/** The date ('YYYY-MM-DD') a sweep is next due, `months` after the last one. */
export function nextSweep(lastSwept, months) {
  const date = new Date(`${lastSwept}T00:00:00Z`)
  date.setUTCMonth(date.getUTCMonth() + months)
  return date.toISOString().slice(0, 10)
}

/** Every customer due a sweep in `month` ('YYYY-MM'), earliest first. */
export function dueIn(customers, month) {
  return customers
    .map((customer) => ({ ...customer, due: nextSweep(customer.lastSwept, customer.interval) }))
    .filter((customer) => customer.due.startsWith(`${month}-`))
    .sort((a, b) => a.due.localeCompare(b.due) || a.id.localeCompare(b.id))
}
