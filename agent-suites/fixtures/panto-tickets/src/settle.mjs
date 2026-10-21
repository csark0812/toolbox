/** Ticket prices in pence. */
export const PRICES = { adult: 1600, child: 1000, concession: 1200 }

/** The ticket platform keeps 8% of each ticket it sells. */
export const FEE_RATE = 0.08

/** Parse a CSV export into records. */
export function parseCsv(text) {
  const [header, ...rows] = text.trim().split('\n')
  const keys = header.split(',')
  return rows.map((row) => Object.fromEntries(row.split(',').map((v, i) => [keys[i], v.trim()])))
}

/** What the platform passes on for one ticket after its fee, in pence. */
export function netOf(band) {
  return PRICES[band] - Math.round(PRICES[band] * FEE_RATE)
}

/** What the platform owes the theatre for one performance, in pence. Door sales are cash we hold. */
export function payoutDue(tickets, performance) {
  return tickets
    .filter((t) => t.performance === performance && t.channel !== 'door' && t.status !== 'refunded')
    .reduce((sum, t) => sum + netOf(t.band), 0)
}
