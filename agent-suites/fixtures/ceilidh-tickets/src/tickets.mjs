export const HALL_LIMIT = 150

export const parseCsv = (text) => {
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])),
  )
}

// Ticket types that are sold. Under-5 tickets are free.
const SOLD = new Set(['adult', 'child', 'family'])

// How many people have tickets, after refunds.
export function ticketsSold(sales) {
  let people = 0
  for (const sale of sales) {
    if (sale.status === 'refunded') continue
    if (!SOLD.has(sale.type)) continue
    people += Number(sale.qty)
  }
  return people
}

export function doorSpaces(sales) {
  return Math.max(0, HALL_LIMIT - ticketsSold(sales))
}
