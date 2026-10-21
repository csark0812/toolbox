import { itemNamed, pounds } from './menu.mjs'

/** What one order line costs: the item and its extras, times the quantity. */
function linePence(line, menu) {
  const extras = (line.extras ?? []).reduce((sum, extra) => sum + itemNamed(menu, extra).pence, 0)
  return (itemNamed(menu, line.item).pence + extras) * line.qty
}

/** The ticket for the hatch: the order, one line per item, and the total. */
export function ticket(order, menu) {
  const total = order.lines.reduce((sum, line) => sum + linePence(line, menu), 0)
  return [
    `Order ${order.id}  ${order.name}`,
    ...order.lines.map((line) => {
      const extras = line.extras?.length ? ` + ${line.extras.join(', ')}` : ''
      return `  ${line.qty} x ${line.item}${extras}  ${pounds(linePence(line, menu))}`
    }),
    `  Total ${pounds(total)}`,
  ]
}
