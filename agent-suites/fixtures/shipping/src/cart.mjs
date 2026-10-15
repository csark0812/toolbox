import { quote } from './rates.mjs'

/** Checkout quote: all items ship together in the smallest box that fits them. */
export function cartQuote(cart) {
  const weight = cart.items.reduce((sum, item) => sum + item.weightKg * item.qty, 0)
  const box = cart.box ?? { l: 30, w: 20, h: 15 }
  return quote(weight, box.l, box.w, box.h, cart.zone, cart.shipping === 'express')
}
