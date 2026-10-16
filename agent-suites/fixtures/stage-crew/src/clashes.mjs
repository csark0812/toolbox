/** The same person however the stage manager typed the name. */
export const personKey = (name) => name.trim().toLowerCase()

const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/**
 * Every pair of shifts worked by one person that overlap in time. Touching shifts do not clash.
 * Each clash is { person, first, second } with the ids of the earlier-starting shift first.
 */
export function clashes(shifts) {
  const found = []
  for (let i = 0; i < shifts.length; i++) {
    for (let j = i + 1; j < shifts.length; j++) {
      const a = shifts[i]
      const b = shifts[j]
      if (personKey(a.crew) !== personKey(b.crew)) continue
      const overlap = new Date(a.start) < new Date(b.end) && new Date(b.start) < new Date(a.end)
      if (!overlap) continue
      const aFirst =
        new Date(a.start) < new Date(b.start) ||
        (new Date(a.start).getTime() === new Date(b.start).getTime() && byText(a.id, b.id) < 0)
      const [first, second] = aFirst ? [a, b] : [b, a]
      found.push({ person: personKey(a.crew), first: first.id, second: second.id })
    }
  }
  const startOf = (id) => new Date(shifts.find((shift) => shift.id === id).start)
  return found.sort(
    (x, y) =>
      byText(x.person, y.person) ||
      startOf(x.first) - startOf(y.first) ||
      startOf(x.second) - startOf(y.second) ||
      byText(x.first, y.first) ||
      byText(x.second, y.second),
  )
}
