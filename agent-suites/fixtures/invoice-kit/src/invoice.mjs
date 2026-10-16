import { formatMoney } from './format.mjs'

export function invoiceLine({ description, quantity, unitCents, currency }) {
  return `${description} x${quantity} @ ${formatMoney(unitCents, currency)} = ${formatMoney(quantity * unitCents, currency)}`
}

export function invoiceTotal(lines, currency) {
  return `Total: ${formatMoney(
    lines.reduce((sum, line) => sum + line.quantity * line.unitCents, 0),
    currency,
  )}`
}
