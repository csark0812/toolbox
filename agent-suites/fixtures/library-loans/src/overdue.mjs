const DAY = 86400000
const FINE_PER_DAY_CENTS = 25
const FINE_CAP_CENTS = 1000
const LOST_AFTER_DAYS = 60

const daysLate = (loan, today) => Math.floor((Date.parse(today) - Date.parse(loan.dueOn)) / DAY)

/** Moves loans past their due date to overdue, and long-overdue loans to lost. */
export function sweep(loans, today) {
  const changed = []
  for (const loan of loans) {
    const late = daysLate(loan, today)
    if (loan.status === 'out' && late > 0) {
      loan.status = 'overdue'
      changed.push(loan.id)
    }
    if (loan.status === 'overdue' && late > LOST_AFTER_DAYS) {
      loan.status = 'lost'
      changed.push(loan.id)
    }
  }
  return changed
}

/** Fine in cents: 25c a day while overdue (capped), the replacement cost once lost. */
export function fineFor(loan, today) {
  if (loan.status === 'lost') return loan.replacementCents ?? 2500
  if (loan.status !== 'overdue') return 0
  return Math.min(FINE_CAP_CENTS, daysLate(loan, today) * FINE_PER_DAY_CENTS)
}
