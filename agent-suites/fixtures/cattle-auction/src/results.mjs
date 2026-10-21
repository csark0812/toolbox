const seconds = (at) => new Date(`1970-01-01T${at}Z`).getTime() / 1000
const paddleKey = (paddle) => paddle.replace(/\s/g, '').toUpperCase()

/** Each lot's result, in sale order. */
export function saleResults({ lots, bids, bidders, retractions }) {
  return lots.map((lot) => {
    const counting = bids.filter(
      (bid) =>
        bid.lot === lot.lot &&
        seconds(bid.at) <= seconds(lot.hammer) &&
        bidders.some((bidder) => paddleKey(bidder.paddle) === paddleKey(bid.paddle)) &&
        !retractions.some(
          (retraction) =>
            retraction.lot === lot.lot &&
            paddleKey(retraction.paddle) === paddleKey(bid.paddle) &&
            seconds(bid.at) <= seconds(retraction.at),
        ),
    )
    const best = [...counting].sort(
      (a, b) => b.amount - a.amount || seconds(a.at) - seconds(b.at),
    )[0]
    if (!best || best.amount < lot.reserve)
      return { lot: lot.lot, sold: false, price: best?.amount ?? null, buyer: null, premium: 0 }
    const buyer = bidders.find((bidder) => paddleKey(bidder.paddle) === paddleKey(best.paddle))
    return {
      lot: lot.lot,
      sold: true,
      price: best.amount,
      buyer: buyer.paddle,
      premium: Math.round(best.amount * 0.025 * 100) / 100,
    }
  })
}

/** What each buyer owes: hammer prices plus premium, in the bidder list's order. */
export function buyerTotals(results, bidders) {
  return bidders
    .map((bidder) => {
      const won = results.filter((result) => result.sold && result.buyer === bidder.paddle)
      return {
        paddle: bidder.paddle,
        name: bidder.name,
        lots: won.length,
        owes: won.reduce((sum, result) => sum + result.price + result.premium, 0),
      }
    })
    .filter((total) => total.lots > 0)
}
