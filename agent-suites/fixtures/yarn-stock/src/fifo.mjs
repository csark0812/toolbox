// What the wool shop's sales cost, first in first out, and what is left on the shelves.

/**
 * What the first `taken` balls of a lot cost. Lots are bought as a whole for `pence`, so the
 * balls are costed cumulatively: once a lot is used up, its balls have cost exactly what was paid.
 */
const costOfFirst = (lot, taken) => Math.round((lot.pence * taken) / lot.qty)

/** Rows by date ("YYYY-MM-DD"); rows on the same date keep the order they were entered in. */
function byDate(rows) {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) =>
      a.row.date < b.row.date ? -1 : a.row.date > b.row.date ? 1 : a.index - b.index,
    )
    .map(({ row }) => row)
}

/** Fresh shelves: every lot in date order with nothing taken yet. */
function shelves(purchases) {
  return byDate(purchases).map((lot) => ({
    sku: lot.sku,
    date: lot.date,
    qty: lot.qty,
    pence: lot.pence,
    taken: 0,
  }))
}

/**
 * Takes a sale off the shelves from the oldest lots of that yarn delivered on or before the
 * sale date (a delivery on the same day is on the shelf in time). Returns its cost and how many
 * balls there weren't.
 */
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

/** The shelves as they stand after every sale before `sale` in date order. */
function shelvesBefore(purchases, sales, sale) {
  const lots = shelves(purchases)
  for (const earlier of byDate(sales)) {
    if (earlier === sale) break
    take(lots, earlier)
  }
  return lots
}

/**
 * The cost of every sale (in the order given) and the closing stock of every yarn bought,
 * by SKU: balls left and what they cost.
 */
export function costOfSales(purchases, sales) {
  const costed = sales.map((sale) => ({
    id: sale.id,
    sku: sale.sku,
    ...take(shelvesBefore(purchases, sales, sale), sale),
  }))
  const lots = shelvesBefore(purchases, sales, null)
  const stock = new Map()
  for (const lot of lots) {
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
