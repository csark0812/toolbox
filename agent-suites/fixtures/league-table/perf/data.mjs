// Full-size seasons for the position chart, generated the same way every time.
export function makeSeasons(count = 8) {
  let seed = 1789
  const next = () => (seed = (seed * 48271) % 2147483647)
  const seasons = []
  for (let s = 0; s < count; s++) {
    const teams = Array.from({ length: 24 }, (_, i) => `Team ${String.fromCharCode(65 + i)}${s}`)
    const fixtures = []
    // A double round robin: each team plays every other team home and away.
    const order = [...teams]
    for (let leg = 0; leg < 2; leg++)
      for (let r = 0; r < teams.length - 1; r++) {
        for (let i = 0; i < teams.length / 2; i++) {
          const [a, b] = [order[i], order[teams.length - 1 - i]]
          const postponed = next() % 40 === 0
          fixtures.push({
            round: leg * (teams.length - 1) + r + 1,
            home: leg ? b : a,
            away: leg ? a : b,
            homeGoals: postponed ? null : next() % 5,
            awayGoals: postponed ? null : next() % 4,
          })
        }
        order.splice(1, 0, order.pop())
      }
    seasons.push({ teams, fixtures })
  }
  return seasons
}
