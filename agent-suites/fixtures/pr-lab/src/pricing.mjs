// Cart pricing in integer cents.

export function lineTotal(item) {
  return item.unitCents * item.quantity
}

export function cartTotal(items) {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}
