// Hidden acceptance for the bill-split rounding bug: shares always add up to the amount split,
// each share is its exact amount rounded down or up, leftover cents follow the documented order,
// and the reported bills print totals that match.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { allocate } = await import(pathToFileURL(join(dir, 'src/allocate.mjs')).href)
const { splitBill, billTotal } = await import(pathToFileURL(join(dir, 'src/split.mjs')).href)

function reference(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0)
  const exact = weights.map((w) => (total * w) / sum)
  const shares = exact.map(Math.floor)
  const leftover = total - shares.reduce((a, b) => a + b, 0)
  exact
    .map((x, index) => ({ index, fraction: x - Math.floor(x) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .slice(0, leftover)
    .forEach(({ index }) => shares[index]++)
  return shares
}
assert.deepEqual(allocate(2000, [1, 1, 1]), [667, 667, 666])
assert.deepEqual(allocate(1000, [1, 1, 1]), [334, 333, 333])
assert.deepEqual(allocate(1002, [1, 1, 1, 1]), [251, 251, 250, 250])
assert.deepEqual(allocate(5, [1, 1, 1]), [2, 2, 1])
let seed = 7
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 2000; round++) {
  const total = next() % 50000
  const weights = Array.from({ length: 1 + (next() % 6) }, () => next() % 4000)
  if (weights.every((w) => w === 0)) weights[0] = 1
  const shares = allocate(total, weights)
  assert.equal(
    shares.reduce((a, b) => a + b, 0),
    total,
    `allocate(${total}, [${weights}]) adds up to ${total}`,
  )
  assert.deepEqual(shares, reference(total, weights), `allocate(${total}, [${weights}])`)
}
const bills = {
  pizza: { people: ['ana', 'ben', 'cy'], items: [{ name: 'Large pizza', price: '20.00' }] },
  dinner: {
    people: ['ana', 'ben', 'cy', 'dee'],
    items: [
      { name: 'Nachos', price: '11.50' },
      { name: 'Ramen', price: '16.00', people: ['ana'] },
      { name: 'Burger', price: '14.25', people: ['ben'] },
      { name: 'Salad', price: '12.75', people: ['cy', 'dee'] },
      { name: 'Wine', price: '38.00', people: ['ana', 'cy', 'dee'] },
    ],
    tipPercent: 18,
  },
}
assert.deepEqual(
  splitBill(bills.pizza).map((s) => s.cents),
  [667, 667, 666],
)
for (const [name, bill] of Object.entries(bills))
  assert.equal(
    splitBill(bill).reduce((sum, s) => sum + s.cents, 0),
    billTotal(bill),
    `${name}: shares add up to the bill`,
  )
for (const file of ['pizza', 'lunch', 'dinner']) {
  const out = execFileSync(process.execPath, ['bin/split.mjs', `data/${file}.json`], {
    cwd: dir,
    encoding: 'utf8',
  })
  const [, charged, billed] = out.match(/total (\$[\d.]+) \(bill (\$[\d.]+)\)/) ?? []
  assert.ok(charged && charged === billed, `${file}: printed total matches the bill\n${out}`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
