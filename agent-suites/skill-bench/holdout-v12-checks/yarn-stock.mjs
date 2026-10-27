// Hidden acceptance for the costing speed-up: the same costs and closing stock as the original
// on random books (lots of awkward sizes costed cumulatively so a used-up lot costs exactly what
// was paid, deliveries on the sale date in time and later ones not, rows on the same date in the
// order entered, shortfalls not filled later, unknown yarns, empty lots and zero sales), the same
// answers when the same arrays are edited in place between calls (a delivery corrected, re-dated
// or added, a sale corrected, moved or removed) and when two sets of books alternate, so nothing
// may be remembered from one call to the next, the caller's books never reordered or changed, the
// frozen timing script under target with the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { costOfSales } = await import(pathToFileURL(join(dir, 'src/fifo.mjs')).href)

const costOfFirst = (lot, taken) => Math.round((lot.pence * taken) / lot.qty)
function byDate(rows) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) =>
      a.row.date < b.row.date ? -1 : a.row.date > b.row.date ? 1 : a.index - b.index,
    )
    .map(({ row }) => row)
}
const shelves = (purchases) =>
  byDate(purchases).map((lot) => ({
    sku: lot.sku,
    date: lot.date,
    qty: lot.qty,
    pence: lot.pence,
    taken: 0,
  }))
function take(lots, sale) {
  let need = sale.qty
  let cost = 0
  for (const lot of lots) {
    if (need <= 0) break
    if (lot.sku !== sale.sku || lot.date > sale.date) continue
    const balls = Math.min(need, lot.qty - lot.taken)
    if (balls <= 0) continue
    cost += costOfFirst(lot, lot.taken + balls) - costOfFirst(lot, lot.taken)
    lot.taken += balls
    need -= balls
  }
  return { cost, short: Math.max(need, 0) }
}
function shelvesBefore(purchases, sales, sale) {
  const lots = shelves(purchases)
  for (const earlier of byDate(sales)) {
    if (earlier === sale) break
    take(lots, earlier)
  }
  return lots
}
function reference(purchases, sales) {
  const costed = sales.map((sale) => ({
    id: sale.id,
    sku: sale.sku,
    ...take(shelvesBefore(purchases, sales, sale), sale),
  }))
  const stock = new Map()
  for (const lot of shelvesBefore(purchases, sales, null)) {
    const line = stock.get(lot.sku) ?? { sku: lot.sku, balls: 0, pence: 0 }
    const left = lot.qty - lot.taken
    if (left > 0) {
      line.balls += left
      line.pence += lot.pence - costOfFirst(lot, lot.taken)
    }
    stock.set(lot.sku, line)
  }
  return {
    sales: costed,
    stock: [...stock.values()].sort((a, b) => (a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0)),
  }
}

let seed = 1618
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const DATES = ['2026-01-03', '2026-01-04', '2026-01-04', '2026-01-09', '2026-02-01']
const SKUS = ['DK-1', 'DK-2', 'DK-10', 'AR-3']
const lot = () => ({
  sku: pick(SKUS),
  date: pick(DATES),
  qty: pick([0, 1, 3, 3, 7, 10, 25]),
  pence: pick([0, 1, 999, 1000, 1999, 2650, 4321]),
})
let saleId = 0
const sale = () => ({
  id: `T${++saleId}`,
  sku: pick([...SKUS, 'XX-9']),
  date: pick(DATES),
  qty: pick([0, 1, 1, 2, 3, 5, 9]),
})
const check = (purchases, sales, label) => {
  const frozen = JSON.stringify({ purchases, sales })
  assert.deepEqual(
    costOfSales(purchases, sales),
    reference(purchases, sales),
    `${label}: ${frozen}`,
  )
  assert.equal(JSON.stringify({ purchases, sales }), frozen, "the caller's books are not changed")
}
for (let round = 0; round < 400; round++) {
  const purchases = Array.from({ length: next() % 9 }, lot)
  const sales = Array.from({ length: next() % 14 }, sale)
  check(purchases, sales, `round ${round}`)
}

// The back office keeps one stock book and edits it in place between calls.
const purchases = Array.from({ length: 6 }, lot)
const sales = Array.from({ length: 10 }, sale)
const other = { purchases: Array.from({ length: 6 }, lot), sales: Array.from({ length: 10 }, sale) }
const edits = [
  () => (purchases[0].pence += 37),
  () => (purchases[1].qty = 25),
  () => (purchases[2].date = '2026-01-02'),
  () => purchases.push({ sku: 'DK-2', date: '2026-01-03', qty: 10, pence: 2650 }),
  () => (sales[0].qty += 4),
  () => (sales[3].date = '2026-01-03'),
  () => (sales[5].sku = 'DK-10'),
  () => sales.splice(2, 1),
  () => sales.reverse(),
  () => purchases.splice(0, purchases.length),
]
check(purchases, sales, 'before any edit')
for (const [i, edit] of edits.entries()) {
  edit()
  check(purchases, sales, `after edit ${i}`)
  check(other.purchases, other.sales, `the other books after edit ${i}`)
  check(purchases, sales, `again after edit ${i}`)
}

assert.equal(
  execFileSync(process.execPath, ['bin/books.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'T101  DK-108    £3.33',
    'T102  DK-108   £11.28',
    'T103  DK-115    £0.00  short 2',
    'T104  DK-115    £8.57',
    'T105  DK-108    £3.34',
    'T106  DK-200    £0.00  short 2',
    'T107  DK-115   £11.42  short 2',
    'Stock',
    'DK-108    7   £18.55',
    'DK-115    0    £0.00',
    'DK-122    5   £15.00',
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
assert.equal(perf.work, 600, 'every sale')
assert.equal(perf.costPence, 364635, 'the same cost of sales')
assert.equal(perf.short, 696, 'the same shortfall')
assert.equal(perf.stockBalls, 824, 'the same balls left')
assert.equal(perf.stockPence, 213965, 'the same closing stock')
// Target is 5 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 10, `median ${perf.medianMs} ms is far above the 5 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
