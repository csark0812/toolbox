export const RATES = { baseCents: 250, perKmCents: 120, perMinuteCents: 30 }

/** The fare for a trip in whole cents. */
export function fare({ km, minutes }) {
  const cents = RATES.baseCents + km * RATES.perKmCents + minutes * RATES.perMinuteCents
  return Math.round(cents)
}

export const dollars = (cents) => `$${(cents / 100).toFixed(2)}`
