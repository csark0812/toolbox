import { feedCost } from '../src/feeds.mjs'
import { loadHorses, pounds, yard } from '../src/horses.mjs'

const [month, file] = process.argv.slice(2)
if (!/^\d{4}-\d{2}$/.test(month ?? '')) {
  console.error('invoices: give a month as YYYY-MM')
  process.exit(2)
}
const [year, m] = month.split('-').map(Number)
const days = new Date(Date.UTC(year, m, 0)).getUTCDate()

const rows = loadHorses(file)
  .sort((a, b) => a.owner.localeCompare(b.owner) || a.name.localeCompare(b.name))
  .map((horse) => {
    const livery = Math.round((yard.liveryPencePerWeek[horse.livery] * days) / 7)
    const feed = feedCost(horse, days)
    return {
      owner: horse.owner,
      horse: horse.name,
      month,
      livery: pounds(livery),
      feedCost: pounds(feed),
      total: pounds(livery + feed),
    }
  })
console.log(Object.keys(rows[0]).join(','))
for (const row of rows)
  console.log(
    Object.values(row)
      .map((v) => (String(v).includes(',') ? `"${v}"` : v))
      .join(','),
  )
