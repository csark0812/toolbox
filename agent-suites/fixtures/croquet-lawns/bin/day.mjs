import { lawnName, lawnStatus, lawnsOn, loadBookings, loadConfig } from '../src/lawns.mjs'

const args = process.argv.slice(2)
const date = args.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg))
const only = args.includes('--lawn') ? args[args.indexOf('--lawn') + 1] : null
if (!date) {
  console.error('usage: npm run day -- YYYY-MM-DD [--lawn ID]')
  process.exit(2)
}
const config = loadConfig()
console.log(`${config.club}, ${date}`)
for (const [lawn, players] of lawnsOn(loadBookings(), date)) {
  if (only && lawn !== only) continue
  const names = players.map((p) => `${p.player} (${p.handicap})`).join(', ')
  console.log(`${lawnName(lawn, config)} [${lawn}] ${lawnStatus(players, config)}: ${names}`)
}
