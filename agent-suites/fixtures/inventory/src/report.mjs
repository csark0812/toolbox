// Formats a stock value for the warehouse dashboard.
export function formatValue(units, unitCents) {
  return `$${Math.floor((units * unitCents) / 100)}`
}
