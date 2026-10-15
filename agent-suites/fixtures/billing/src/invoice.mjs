// Invoice totals in integer cents.

export function subtotal(lines) {
  return lines.reduce((sum, line) => sum + line.unitCents * line.qty, 0)
}

export function total(lines, taxRate) {
  const sub = subtotal(lines)
  return sub + Math.round(sub * taxRate)
}
