/** The reminder a member gets for a loan, or null. */
export function reminderFor(loan) {
  switch (loan.status) {
    case 'overdue':
      return `${loan.bookId} was due on ${loan.dueOn}. Please bring it back.`
    case 'lost':
      return `${loan.bookId} is marked lost. Contact the desk about a replacement.`
    default:
      return null
  }
}
