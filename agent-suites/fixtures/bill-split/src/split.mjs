import { allocate } from './allocate.mjs'
import { toCents } from './money.mjs'

/**
 * bill: { people: string[], items: [{ name, price, people? }], tipPercent? }
 * An item without `people` is shared by everyone. Returns [{ person, cents }] in `people` order.
 */
export function splitBill(bill) {
  const owed = new Map(bill.people.map((person) => [person, 0]))
  for (const item of bill.items) {
    const sharers = item.people ?? bill.people
    for (const person of sharers)
      if (!owed.has(person)) throw new Error(`${item.name}: unknown person ${person}`)
    const shares = allocate(
      toCents(item.price),
      sharers.map(() => 1),
    )
    sharers.forEach((person, i) => owed.set(person, owed.get(person) + shares[i]))
  }
  const subtotal = [...owed.values()].reduce((a, b) => a + b, 0)
  const tip = Math.round((subtotal * (bill.tipPercent ?? 0)) / 100)
  if (tip > 0) {
    const tipShares = allocate(tip, [...owed.values()])
    bill.people.forEach((person, i) => owed.set(person, owed.get(person) + tipShares[i]))
  }
  return bill.people.map((person) => ({ person, cents: owed.get(person) }))
}

/** What the whole table pays: item prices plus the rounded tip. */
export function billTotal(bill) {
  const subtotal = bill.items.reduce((sum, item) => sum + toCents(item.price), 0)
  return subtotal + Math.round((subtotal * (bill.tipPercent ?? 0)) / 100)
}
