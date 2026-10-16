import { toCurrency } from './legacy/currency.mjs'

export function receipt(payments) {
  return payments.map((payment) => `${payment.method}: ${toCurrency(payment.amount)}`).join('\n')
}

export function refundLine(amount) {
  return `Refund ${toCurrency(-amount)}`
}
