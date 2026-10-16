// Older money helper, still used by receipts.
export function toCurrency(amount, symbol = '$') {
  const value = (Math.round(amount * 100) / 100).toFixed(2)
  return amount < 0 ? `(${symbol}${value.slice(1)})` : `${symbol}${value}`
}
