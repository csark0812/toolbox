const DAY = 86400000
export const LOAN_DAYS = 21

let nextId = 1000

export function checkout(loans, { bookId, memberId, today }) {
  const active = loans.find(
    (loan) => loan.bookId === bookId && (loan.status === 'out' || loan.status === 'overdue'),
  )
  if (active) throw new Error(`${bookId} is already on loan`)
  const loan = {
    id: `L${nextId++}`,
    bookId,
    memberId,
    status: 'out',
    outOn: today,
    dueOn: new Date(Date.parse(today) + LOAN_DAYS * DAY).toISOString().slice(0, 10),
  }
  loans.push(loan)
  return loan
}

export function checkin(loans, loanId, today) {
  const loan = loans.find((entry) => entry.id === loanId)
  if (!loan) throw new Error(`No loan ${loanId}`)
  if (loan.status !== 'out' && loan.status !== 'overdue' && loan.status !== 'lost')
    throw new Error(`${loanId} is not on loan`)
  loan.status = 'returned'
  loan.returnedOn = today
  return loan
}
