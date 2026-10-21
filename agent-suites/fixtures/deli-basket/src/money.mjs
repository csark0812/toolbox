import { readFileSync } from 'node:fs'

/** The items in the current basket. */
export function loadBasket() {
  return JSON.parse(readFileSync(new URL('../data/basket.json', import.meta.url), 'utf8'))
}

/** Pence as pounds for the receipt, like `£4.50`. */
export function pounds(pence) {
  return `£${(pence / 100).toFixed(2)}`
}

/** The supper-club saving on a subtotal: 10%, rounded down to a whole penny. */
export function memberSaving(pence) {
  return Math.floor(pence / 10)
}
