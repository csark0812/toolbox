#!/bin/sh
# The price board for the barn wall, straight from the till's rates.
cd "$(dirname "$0")/.." || exit 1
node --input-type=module -e "
const { RATES } = await import('./bin/till.mjs')
console.log('HOLLOW LANE PUMPKINS')
for (const [variety, pence] of Object.entries(RATES)) {
  console.log(variety.toUpperCase().padEnd(10) + ('£' + (pence / 100).toFixed(2) + ' a kilo').padStart(14))
}
console.log('Weighed at the till, rounded to the nearest 10p')
"
