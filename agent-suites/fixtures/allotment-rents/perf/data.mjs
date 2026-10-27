// The society's full rent history, generated the same way every time.
export function makeHistory() {
  let seed = 20250401
  const next = () => (seed = (seed * 48271) % 2147483647)
  const date = (year, dayOfYear) =>
    new Date(Date.UTC(year, 0, 1) + dayOfYear * 86400000).toISOString().slice(0, 10)
  const plots = Array.from({ length: 70 }, (_, i) => `${1 + (i >> 1)}${i % 2 ? 'B' : 'A'}`)
  const tenancies = []
  let tenantNo = 0
  for (const plot of plots) {
    let year = 2019
    let from = date(year, next() % 90)
    while (year < 2026) {
      const tenant = `Tenant ${String(next() % 9 === 0 ? tenantNo - 1 : tenantNo++).padStart(3, '0')}`
      year += 1 + (next() % 4)
      const handover = date(year, 150 + (next() % 150))
      const to = year >= 2026 ? null : handover
      tenancies.push({ plot, tenant, from, to })
      from = next() % 3 === 0 ? handover : date(year, 151 + (next() % 150) + 150 + 1)
    }
  }
  const invoices = []
  const payments = []
  for (let year = 2019; year <= 2026; year++) {
    for (const [i, plot] of plots.entries()) {
      const amount = 3000 + (i % 7) * 400 + (year - 2019) * 150
      invoices.push({ id: `INV-${year}-${i + 1}`, plot, issued: `${year}-04-01`, amount })
      for (let n = next() % 4; n > 0; n--) {
        const style = next() % 6
        const [number, letter] = [plot.slice(0, -1), plot.slice(-1)]
        const reference = [
          `PLOT ${plot}`,
          `plot ${number}${letter.toLowerCase()} rent`,
          `PLT-${number.padStart(3, '0')}${letter}`,
          `${plot} ${year}`,
          `${year} rent ${plot}`,
          'ALLOTMENT',
        ][style]
        const pounds = amount / 100 / (1 + (next() % 3)) + (next() % 5 === 0 ? 0.005 : 0)
        payments.push({
          date: date(year, 85 + (next() % 200)),
          amount: Math.round(pounds * 1000) / 1000,
          reference,
        })
      }
    }
  }
  return { tenancies, invoices, payments }
}
