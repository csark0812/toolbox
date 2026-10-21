// The club's rounds since the records went online, generated the same way every time.
const PLAYERS = [
  'Ann Kerr',
  'Tom Hale',
  'Raj Mehta',
  'Liz Ford',
  'Owen Pryce',
  'Mia Sato',
  'Ben Ash',
  'Cleo Dunn',
  'Dan Roe',
  'Eva Lind',
  'Finn Doyle',
  'Gina Ruiz',
]
const COURSES = ['Old Course', 'Heath', 'Links']
const pad = (n) => String(n).padStart(2, '0')

export function makeClub() {
  let seed = 20261010
  const next = () => (seed = (seed * 48271) % 2147483647)
  const rounds = []
  for (let n = 0; n < 1300; n++) {
    const at = new Date(Date.UTC(2023, 0, 1) + (next() % 1300) * 86400000)
    let player = PLAYERS[next() % PLAYERS.length]
    if (next() % 5 === 0) player = player.toUpperCase()
    if (next() % 7 === 0) player = ` ${player.toLowerCase()} `
    rounds.push({
      id: `R${String(n).padStart(5, '0')}`,
      player,
      date: `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`,
      course: COURSES[next() % COURSES.length],
      gross: 72 + (next() % 30),
    })
  }
  const courses = [
    { name: 'Old Course', rating: 712, slope: 131 },
    { name: 'Heath', rating: 689, slope: 118 },
    { name: 'Links', rating: 735, slope: 140 },
  ]
  return { rounds, courses }
}
