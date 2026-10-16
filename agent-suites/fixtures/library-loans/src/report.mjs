import { fineFor } from './overdue.mjs'

const ORDER = ['out', 'overdue', 'lost', 'returned']
const LABELS = { out: 'On loan', overdue: 'Overdue', lost: 'Lost', returned: 'Returned' }

export function statusCounts(loans) {
  const counts = Object.fromEntries(ORDER.map((status) => [status, 0]))
  for (const loan of loans) counts[loan.status]++
  return counts
}

export function report(loans, today) {
  const counts = statusCounts(loans)
  const lines = ORDER.map((status) => `${LABELS[status].padEnd(9)} ${counts[status]}`)
  const fines = loans.reduce((sum, loan) => sum + fineFor(loan, today), 0)
  lines.push(`Fines due ${(fines / 100).toFixed(2)}`)
  return lines.join('\n')
}

export function isActive(loan) {
  return loan.status !== 'returned'
}
