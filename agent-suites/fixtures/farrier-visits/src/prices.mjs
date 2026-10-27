// Prices in pence for each kind of work.
export const PRICES = { trim: 3500, front: 6500, all: 9500 }

export function priceFor(work) {
  const price = PRICES[work]
  if (price === undefined) throw new Error(`no price for ${work}`)
  return price
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
