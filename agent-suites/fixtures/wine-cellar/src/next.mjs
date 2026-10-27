const DAY = 24 * 60 * 60 * 1000
const producerKey = (name) => name.trim().toLowerCase()
const byText = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/** Bottles whose drinking window is open on `today`, soonest to close first. */
export function drinkNext(cellar, today) {
  const now = new Date(`${today}T00:00:00Z`)
  const list = []
  for (const bottle of cellar) {
    const opens = new Date(`${bottle.opens}T00:00:00Z`)
    const closes = new Date(`${bottle.closes}T00:00:00Z`)
    if (opens > now || closes < now) continue
    const sameVintage = cellar
      .filter(
        (other) =>
          producerKey(other.producer) === producerKey(bottle.producer) &&
          other.vintage === bottle.vintage,
      )
      .sort((a, b) => b.score - a.score || byText(a.id, b.id))
    list.push({
      id: bottle.id,
      wine: `${bottle.producer.trim()} ${bottle.wine} ${bottle.vintage}`,
      rank: sameVintage.findIndex((other) => other.id === bottle.id) + 1,
      daysLeft: Math.round((closes - now) / DAY),
    })
  }
  return list.sort((a, b) => {
    const closesA = new Date(`${cellar.find((bottle) => bottle.id === a.id).closes}T00:00:00Z`)
    const closesB = new Date(`${cellar.find((bottle) => bottle.id === b.id).closes}T00:00:00Z`)
    return closesA - closesB || a.rank - b.rank || byText(a.id, b.id)
  })
}
