export const EXPIRY_MONTHS = 12

/** `YYYY-MM-DD` plus whole months; the 29th of February becomes the 28th in other years. */
export function addMonths(date, months) {
  const [year, month, day] = date.split('-').map(Number)
  const total = month - 1 + months
  const target = new Date(Date.UTC(year + Math.floor(total / 12), total % 12, 1))
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return target.toISOString().slice(0, 10)
}

/** The first day on which points earned on `date` are no longer valid. */
export const expiresOn = (date) => addMonths(date, EXPIRY_MONTHS)

/**
 * Replay a card's events up to and including `on`. Points are kept in batches by the day they
 * were earned; a batch lapses on its expiry day.
 */
export function replay(events, on) {
  const batches = []
  const history = []
  const lapse = (today) => {
    for (const batch of batches)
      if (batch.remaining > 0 && batch.expires <= today) {
        history.push({ date: batch.expires, type: 'expired', points: batch.remaining })
        batch.remaining = 0
      }
  }
  const ordered = [...events].sort((a, b) => a.date.localeCompare(b.date))
  for (const event of ordered) {
    if (event.date > on) break
    lapse(event.date)
    if (event.type === 'earn') {
      batches.push({ earned: event.date, expires: expiresOn(event.date), remaining: event.points })
    } else if (event.type === 'redeem') {
      const balance = batches.reduce((sum, batch) => sum + batch.remaining, 0)
      if (event.points > balance)
        throw new RangeError(`cannot redeem ${event.points} on ${event.date}: balance ${balance}`)
      let left = event.points
      for (const batch of [...batches].reverse()) {
        const used = Math.min(batch.remaining, left)
        batch.remaining -= used
        left -= used
      }
    } else throw new RangeError(`unknown event type: ${event.type}`)
    history.push({ date: event.date, type: event.type, points: event.points })
  }
  lapse(on)
  history.sort((a, b) => a.date.localeCompare(b.date))
  return { balance: batches.reduce((sum, batch) => sum + batch.remaining, 0), history, batches }
}
