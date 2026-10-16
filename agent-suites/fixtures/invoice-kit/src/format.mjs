// Money formatting for invoices.
export function formatMoney(cents, currency = 'USD') {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const whole = Math.floor(abs / 100).toLocaleString('en-US')
  const frac = String(abs % 100).padStart(2, '0')
  return `${sign}${currency === 'EUR' ? '€' : '$'}${whole}.${frac}`
}
