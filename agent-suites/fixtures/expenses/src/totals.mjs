/** Total claimed per person, in dollars, people sorted by name. */
export function totalsByPerson(expenses) {
  const totals = {}
  for (const { person, amount } of expenses) totals[person] = (totals[person] ?? 0) + amount
  return Object.keys(totals)
    .sort()
    .map((person) => ({ person, total: totals[person] }))
}

export const formatDollars = (amount) => `$${amount.toFixed(2)}`
