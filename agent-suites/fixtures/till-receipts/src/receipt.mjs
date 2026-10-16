export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`

const centre = (text, width) => {
  const gap = Math.max(0, width - [...text].length)
  return `${' '.repeat(Math.floor(gap / 2))}${text}`
}

/** A sale's receipt as printed, one string per line. */
export function receiptLines(sale, width = 32) {
  const rule = '-'.repeat(width)
  const lines = [centre(sale.shop, width)]
  const number = `Sale ${sale.number}`
  lines.push(`${number}${sale.date.padStart(width - number.length)}`)
  lines.push(rule)
  let total = 0
  for (const item of sale.items) {
    const price = item.qty * item.unitPence
    total += price
    lines.push(`${`${item.qty} x ${item.name}`.padEnd(width - 8)}${pounds(price).padStart(8)}`)
  }
  lines.push(rule)
  lines.push(`${'TOTAL'.padEnd(width - 8)}${pounds(total).padStart(8)}`)
  lines.push(...sale.footer.split('\n'))
  return lines
}
