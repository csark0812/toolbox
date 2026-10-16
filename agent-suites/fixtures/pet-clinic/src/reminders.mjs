export const REMINDER_DAYS = 10

const DAY = 86400000
const days = (from, to) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY)

/** Status of one vaccination on `today`: overdue, due today, due in N days, or null if not soon. */
export function status(due, today) {
  const left = days(today, due)
  if (left <= 0) return { kind: 'overdue', label: `OVERDUE by ${-left} days` }
  if (left <= REMINDER_DAYS) return { kind: 'soon', label: `due in ${left} days` }
  return null
}

/** Every vaccination that needs attention, most urgent first. */
export function dueList(pets, today) {
  const rows = []
  for (const pet of pets)
    for (const vaccine of pet.vaccines) {
      const s = status(vaccine.due, today)
      if (s)
        rows.push({
          pet: pet.name,
          species: pet.species,
          owner: pet.owner,
          vaccine: vaccine.name,
          due: vaccine.due,
          ...s,
        })
    }
  return rows.sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.pet < b.pet ? -1 : 1))
}
