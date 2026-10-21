// Four seasons of the syndicate's books, generated the same way every time.
export function makeBooks() {
  let seed = 20261021
  const next = () => (seed = (seed * 48271) % 2147483647)
  const day = (n) => new Date(Date.UTC(2023, 0, 1) + n * 86400000).toISOString().slice(0, 10)
  const NAMES = [
    'Ros',
    'Tam',
    'Ifan',
    'Mei',
    'Olu',
    'Kit',
    'Bram',
    'Nell',
    'Saul',
    'Vi',
    'Wyn',
    'Ada',
  ]
  const members = NAMES.map((name, i) => {
    const member = { id: `m${i + 1}`, name }
    if (i % 5 === 0) member.share = 2
    if (i === 10) member.joined = '2024-04-01'
    if (i === 3) member.left = '2025-09-30'
    return member
  })
  const trips = []
  for (let i = 0; i < 6000; i++) {
    const member = next() % 40 === 0 ? 'guest' : members[next() % members.length].id
    trips.push({
      member,
      date: day(next() % 1460),
      hours: (1 + (next() % 70)) / 10 + (next() % 3 ? 0 : 0.05),
    })
  }
  const costs = []
  for (let month = 0; month < 48; month++) {
    const from = new Date(Date.UTC(2023, month, 1)).toISOString().slice(0, 10)
    const to = new Date(Date.UTC(2023, month + 1, 0)).toISOString().slice(0, 10)
    costs.push({ id: `mooring-${from.slice(0, 7)}`, from, to, pence: 41000, basis: 'shares' })
    if (month % 3 === 0) {
      const end = new Date(Date.UTC(2023, month + 3, 0)).toISOString().slice(0, 10)
      costs.push({
        id: `engine-${from.slice(0, 7)}`,
        from,
        to: end,
        pence: 9000 + (next() % 60000),
        basis: 'hours',
      })
    }
  }
  // Fuel is bought by the week, after the Sunday fill-up.
  for (let week = 0; week < 208; week++) {
    const from = day(week * 7)
    costs.push({
      id: `fuel-${from}`,
      from,
      to: day(week * 7 + 6),
      pence: 800 + (next() % 6000),
      basis: 'hours',
    })
  }
  for (let year = 2023; year < 2027; year++) {
    costs.push({
      id: `insurance-${year}`,
      from: `${year}-01-01`,
      to: `${year}-12-31`,
      pence: 128700,
      basis: 'equal',
    })
    costs.push({
      id: `rebate-${year}`,
      from: `${year}-01-01`,
      to: `${year}-12-31`,
      pence: -(1000 + (next() % 9000)),
      basis: 'equal',
    })
  }
  return { members, trips, costs }
}
