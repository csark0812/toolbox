const PRICES = { quick: 320, standard: 410, hot: 480 }

/** What one programme costs, in pence. */
export function price(programme) {
  if (programme.startsWith('dry-')) return Math.ceil(Number(programme.slice(4)) / 10) * 100
  const pence = PRICES[programme]
  if (pence === undefined) throw new RangeError(`Unknown programme ${programme}`)
  return pence
}

/** A customer's bill for one month (`YYYY-MM`): the programmes charged and the total in pence. */
export function bill(entries, card, month) {
  const charged = entries.filter(
    (entry) => entry.event === 'start' && entry.time.startsWith(month) && entry.card.includes(card),
  )
  return {
    card,
    programmes: charged.length,
    pence: charged.reduce((sum, entry) => sum + price(entry.programme), 0),
  }
}
