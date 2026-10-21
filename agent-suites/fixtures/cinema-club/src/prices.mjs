export const MATINEE = 750
export const EVENING = 1000

/** The full price of a screening in pence: matinees start before 17:00. */
export const basePrice = (screening) => (screening.time < '17:00' ? MATINEE : EVENING)

export const money = (pence) => `£${(pence / 100).toFixed(2)}`
