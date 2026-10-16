import * as util from './util.mjs'

const FEE_CENTS = 150

/** Order summary for `qty` tickets, with a per-ticket fee on paid shows. */
export function orderSummary(show, qty) {
  if (show.soldOut) throw new Error(`${show.artist} is sold out`)
  const fees = show.priceCents === 0 ? 0 : FEE_CENTS * qty
  const total = show.priceCents * qty + fees
  return {
    lines: [
      `${qty} x ${show.artist} @ ${util.priceLabel(show.priceCents)}`,
      `fees ${util.priceLabel(fees)}`,
      `total ${util.priceLabel(total)}`,
    ],
    totalCents: total,
  }
}
