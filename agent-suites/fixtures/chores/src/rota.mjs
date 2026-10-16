/** Week number from an ISO week label like `2026-W42`. */
export function weekNumber(label) {
  const match = /^(\d{4})-W(\d{2})$/.exec(label)
  if (!match) throw new RangeError(`not an ISO week: ${label}`)
  return Number(match[1]) * 53 + Number(match[2])
}

/** Each chore and who does it in `week`: chore i goes to member (i + week) mod n. */
export function rota(household, week) {
  const n = household.members.length
  const offset = weekNumber(week)
  return household.chores.map((chore, i) => ({
    chore,
    member: household.members[(i + offset) % n].name,
  }))
}
