// A full day's sale, generated the same way every time.
const pad = (n) => String(n).padStart(2, '0')
const clock = (s) => `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`

export function makeSale() {
  let seed = 20261114
  const next = () => (seed = (seed * 48271) % 2147483647)
  const bidders = Array.from({ length: 450 }, (_, n) => ({
    paddle: `P${n + 1}`,
    name: `Bidder ${n + 1}`,
  }))
  const lots = []
  const bids = []
  const retractions = []
  let now = 9 * 3600
  for (let n = 1; n <= 450; n++) {
    const lot = String(n)
    const reserve = 500 + (next() % 60) * 100
    let amount = reserve - 400 + (next() % 5) * 50
    const count = 15 + (next() % 30)
    for (let b = 0; b < count; b++) {
      now += next() % 4
      amount += (next() % 4) * 10
      const number = 1 + (next() % 480)
      const paddle = next() % 6 === 0 ? ` p${number}` : `P${number}`
      bids.push({ lot, paddle, amount, at: clock(now) })
      if (next() % 90 === 0) retractions.push({ lot, paddle: `P${number}`, at: clock(now + 2) })
    }
    lots.push({ lot, description: `Lot ${n}`, reserve, hammer: clock(now - (next() % 3)) })
    now += 30
  }
  // The platform's file and the clerk's are merged, not sorted.
  for (let i = bids.length - 1; i > 0; i--) {
    const j = next() % (i + 1)
    if (next() % 3 === 0) [bids[i], bids[j]] = [bids[j], bids[i]]
  }
  return { lots, bids, bidders, retractions }
}
