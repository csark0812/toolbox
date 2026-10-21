// The society's whole cellar, generated the same way every time.
const PRODUCERS = [
  'Ch. Musar',
  "Tyrrell's",
  'Domaine Huet',
  'Felton Road',
  'Bodegas Tondonia',
  'Ridge',
  'Giacomo Conterno',
  'Weingut Keller',
  'Domaine Tempier',
  'Mount Mary',
  'Ch. Palmer',
  'Raveneau',
  'Egon Muller',
  'Vega Sicilia',
  'Dr Loosen',
  'Kanonkop',
]
const WINES = ['Rouge', 'Blanc', 'Reserva', 'Riesling', 'Pinot Noir', 'Cabernet']
const pad = (n) => String(n).padStart(2, '0')

export function makeCellar() {
  let seed = 20261021
  const next = () => (seed = (seed * 48271) % 2147483647)
  const day = (offset) => {
    const at = new Date(Date.UTC(2018, 0, 1) + offset * 86400000)
    return `${at.getUTCFullYear()}-${pad(at.getUTCMonth() + 1)}-${pad(at.getUTCDate())}`
  }
  const cellar = []
  for (let n = 0; n < 3000; n++) {
    let producer = PRODUCERS[next() % PRODUCERS.length]
    if (next() % 5 === 0) producer = producer.toUpperCase()
    if (next() % 7 === 0) producer = ` ${producer.toLowerCase()} `
    const opens = next() % 4000
    cellar.push({
      id: `B${String(n).padStart(5, '0')}`,
      producer,
      wine: WINES[next() % WINES.length],
      vintage: 2005 + (next() % 15),
      score: 84 + (next() % 14),
      opens: day(opens),
      closes: day(opens + 200 + (next() % 3000)),
    })
  }
  return cellar
}
