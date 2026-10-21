export const PENCE_PER_DAY = 20
const DAY = 24 * 60 * 60 * 1000
const dayNumber = (date) => Date.parse(`${date}T00:00:00Z`) / DAY

/** Days a loan is late, up to its return or `today` if it is still out. */
export function daysLate(loan, today) {
  const end = loan.returned ?? today
  return Math.max(0, dayNumber(end) - dayNumber(loan.due) + 1)
}

/** Each family's late toys and fine in pence, biggest fine first. */
export function finesByFamily(loans, today) {
  const families = new Map()
  for (const loan of loans) {
    const fine = daysLate(loan, today) * PENCE_PER_DAY
    if (!fine) continue
    const entry = families.get(loan.family) ?? { family: loan.family, toys: 0, pence: 0 }
    entry.toys++
    entry.pence += fine
    families.set(loan.family, entry)
  }
  return [...families.values()].sort((a, b) => b.pence - a.pence || (a.family < b.family ? -1 : 1))
}
