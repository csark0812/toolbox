// Stock records: { sku, name, onHand, reorderAt }.

export function stockLine(item) {
  return `${item.sku}  ${item.name}: ${item.onHand} on hand`
}
