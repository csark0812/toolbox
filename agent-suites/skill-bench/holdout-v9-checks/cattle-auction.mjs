// Hidden acceptance for the sale results speed-up: the same results and buyer totals as the
// original on random sales (paddles typed in any case with spaces, unregistered bidders, bids on
// the hammer, repeated retractions, equal bids in the same second, odd amounts for the premium),
// the frozen timing script under target with the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { buyerTotals, saleResults } = await import(pathToFileURL(join(dir, 'src/results.mjs')).href)

const seconds = (at) => new Date(`1970-01-01T${at}Z`).getTime() / 1000
const paddleKey = (paddle) => paddle.replace(/\s/g, '').toUpperCase()
function referenceResults({ lots, bids, bidders, retractions }) {
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
function referenceTotals(results, bidders) {
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
let seed = 41
const next = () => (seed = (seed * 48271) % 2147483647)
const TIMES = ['10:00:00', '10:00:05', '10:00:05', '10:00:09', '10:00:10', '10:00:11']
const PADDLES = ['P1', 'p1', ' P1', 'P2', 'p 2', 'P3', 'P9', 'P10']
for (let round = 0; round < 400; round++) {
  const bidders = [
    { paddle: 'P1', name: 'Ann' },
    { paddle: 'P2', name: 'Bob' },
    { paddle: 'P3', name: 'Cy' },
    { paddle: 'P10', name: 'Di' },
  ]
  const lots = ['1', '2', '3'].map((lot) => ({
    lot,
    description: lot,
    reserve: [1000, 1101, 1203][next() % 3],
    hammer: TIMES[1 + (next() % 5)],
  }))
  const bids = Array.from({ length: next() % 18 }, () => ({
    lot: lots[next() % 3].lot,
    paddle: PADDLES[next() % PADDLES.length],
    amount: 997 + (next() % 9) * 51,
    at: TIMES[next() % TIMES.length],
  }))
  const retractions = Array.from({ length: next() % 4 }, () => ({
    lot: lots[next() % 3].lot,
    paddle: PADDLES[next() % PADDLES.length],
    at: TIMES[next() % TIMES.length],
  }))
  const sale = { lots, bids, bidders, retractions }
  const frozen = JSON.stringify(sale)
  const results = saleResults(sale)
  assert.deepEqual(results, referenceResults(sale), `round ${round}: ${frozen}`)
  assert.deepEqual(
    buyerTotals(results, bidders),
    referenceTotals(results, bidders),
    `round ${round} totals`,
  )
  assert.equal(JSON.stringify(sale), frozen, "the caller's sale is not changed")
}
assert.equal(
  execFileSync(process.execPath, ['bin/results.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'lot   1  sold  £3650 to P14',
    'lot   2  not sold (highest £2450)',
    'lot   3  sold  £6300 to P47',
    'lot   4  sold  £2000 to P31',
    'lot   5  sold  £5500 to P22',
    '',
    'P14  Ellen Robson     1 lots  £3741.25',
    'P22  Dodd & Sons      1 lots  £5637.50',
    'P31  Walter Hume      1 lots  £2050.00',
    'P47  Tynedale Farms   1 lots  £6457.50',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 346, 'the same lots sold')
assert.equal(perf.buyers, 250, 'the same buyers')
// Target is 15 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 35, `median ${perf.medianMs} ms is far above the 15 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
