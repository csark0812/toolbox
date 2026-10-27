// Click-and-collect quotes. The web shop imports quoteOrder from 'pumpkin-patch/orders'.

// Pounds per kilo, as on the web shop's product pages.
const RATE = { carving: 1.2, giant: 0.85, munchkin: 2.4, crown: 1.8 }
// Every pumpkin picked for an order costs at least this, however small.
const MIN_PENCE = 200

function price(kg, variety) {
  if (!Object.hasOwn(RATE, variety)) throw new Error(`We don't sell ${variety} pumpkins`)
  const pence = Math.round(kg * RATE[variety] * 10) * 10
  return Math.max(pence, MIN_PENCE)
}

export function quoteOrder(items) {
  const lines = items.map(({ variety, kg }) => ({ variety, kg, pence: price(kg, variety) }))
  return { lines, totalPence: lines.reduce((sum, line) => sum + line.pence, 0) }
}
