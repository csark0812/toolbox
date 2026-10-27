const DAY = 24 * 60 * 60 * 1000

/** Whole days from `today` until `start`, both `YYYY-MM-DD`. */
export function daysBefore(start, today) {
  return Math.round((Date.parse(start) - Date.parse(today)) / DAY)
}

/** Refund in pence for a paid booking of `price` pence cancelled on `today`. */
export function refundFor(price, start, today) {
  const days = daysBefore(start, today)
  if (days >= 7) return price
  if (days > 0) return Math.floor(price / 2)
  return 0
}
