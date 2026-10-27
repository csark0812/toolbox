/** One line of the customer list. */
export function customerLine(customer) {
  const pints = `${customer.pints} ${customer.pints === 1 ? 'pint' : 'pints'}`
  return `${customer.name.padEnd(12)} ${customer.address.padEnd(18)} ${pints.padEnd(8)} ${customer.days.join(' ')}`
}
