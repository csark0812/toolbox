const SYMBOLS = { GBP: '£', EUR: '€' }

/**
 * Pence as money text. formatPrice(1250) is '£12.50'; formatPrice(1250, 'GBP', false) is
 * '12.50 GBP'; the last argument is the number of decimal places.
 */
export function formatPrice(pence, currency = 'GBP', showSymbol = true, decimals = 2) {
  const symbol = SYMBOLS[currency]
  if (symbol === undefined) throw new RangeError(`unknown currency ${currency}`)
  const amount = (pence / 100).toFixed(decimals)
  return showSymbol ? `${symbol}${amount}` : `${amount} ${currency}`
}
