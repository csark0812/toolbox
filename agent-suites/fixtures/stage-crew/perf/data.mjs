// A full season's rota for three stages, generated the same way every time.
const NAMES = [
  'Kim Ade',
  'Ola Berg',
  'Rui Costa',
  'Tess Lund',
  'Ana Diaz',
  'Ben Okafor',
  'Cara Holt',
  'Dev Patel',
  'Eli Moss',
  'Fay Wong',
  'Gus Ito',
  'Hana Kerr',
]
const STAGES = ['Main', 'Studio 1', 'Studio 2']
const pad = (n) => String(n).padStart(2, '0')

export function makeSeason() {
  let seed = 20261016
  const next = () => (seed = (seed * 48271) % 2147483647)
  const shifts = []
  for (let n = 0; n < 2600; n++) {
    const day = new Date(Date.UTC(2026, 8, 1 + (next() % 120)))
    const start = 8 * 60 + (next() % 48) * 15
    const end = start + 120 + (next() % 20) * 15
    const stamp = (minutes) => {
      const at = new Date(day.getTime() + minutes * 60000)
      return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}T${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}`
    }
    let crew = NAMES[next() % NAMES.length]
    if (next() % 5 === 0) crew = crew.toUpperCase()
    if (next() % 7 === 0) crew = ` ${crew.toLowerCase()} `
    shifts.push({
      id: `S${String(n).padStart(4, '0')}`,
      crew,
      stage: STAGES[next() % STAGES.length],
      start: stamp(start),
      end: stamp(end),
    })
  }
  return shifts
}
