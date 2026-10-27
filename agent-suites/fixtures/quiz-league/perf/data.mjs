// A full season of the league, generated the same way every time.
export function makeSeason() {
  let seed = 20260903
  const next = () => (seed = (seed * 48271) % 2147483647)
  const WORDS = [
    'Quiz',
    'Owls',
    'Brains',
    'Pints',
    'Facts',
    'Trivia',
    'Nerds',
    'Know',
    'Alls',
    'Red',
    'Lion',
    'Crown',
  ]
  const teams = Array.from({ length: 36 }, (_, i) => ({
    name: `${WORDS[i % WORDS.length]} ${WORDS[(i * 7 + 3) % WORDS.length]} ${i}`,
    aliases: [`team ${i}`, `T${i}`],
  }))
  teams.push({ name: 'Late Joiners' })
  const scrawl = (name) => {
    const cased =
      next() % 3 === 0 ? name.toLowerCase() : next() % 4 === 0 ? name.toUpperCase() : name
    return next() % 5 === 0 ? ` ${cased.replace(' ', '  ')} ` : cased
  }
  const nights = []
  for (let week = 0; week < 26; week++) {
    const date = new Date(Date.UTC(2026, 8, 3) + week * 7 * 86400000).toISOString().slice(0, 10)
    const entries = []
    for (const [i, team] of teams.slice(0, 36).entries()) {
      if (next() % 5 === 0) continue
      const name = next() % 3 === 0 ? team.aliases[next() % 2] : team.name
      const rounds = Array.from({ length: 8 }, () => (next() % 21) / 2)
      const sheet = { team: scrawl(name), rounds, joker: next() % 10 }
      entries.push(sheet)
      if (next() % 25 === 0)
        entries.push({ ...sheet, rounds: rounds.map((r) => Math.min(10, r + 0.5)) })
      if (i % 9 === 0 && next() % 2 === 0)
        entries.push({ team: `Visitors ${next() % 5}`, rounds, joker: 1 })
    }
    nights.push({ date, entries })
  }
  // Nights are entered as the sheets come back, not in date order.
  for (let i = nights.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    ;[nights[i], nights[j]] = [nights[j], nights[i]]
  }
  return { teams, nights }
}
