import { dayTotals, formatTotals } from '../src/day.mjs'
import { loadFleeces } from '../src/fleeces.mjs'

const day = process.argv[2]
if (!day) {
  console.error('usage: npm run day -- DAY')
  process.exit(2)
}
console.log(`Fellside Wool Fair, day ${day}`)
console.log(formatTotals(dayTotals(loadFleeces(), day)))
