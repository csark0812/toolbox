export const HOURLY_CENTS = 300

/** The pre-2025 tariff. */
export function legacyRate(minutes) {
  return Math.ceil(minutes / 30) * 120
}

/** Minutes between two ISO timestamps. */
export function stayMinutes(stay) {
  return (Date.parse(stay.out) - Date.parse(stay.in)) / 60000
}

/** The fee for a stay, in cents. */
export function fee(stay) {
  const hours = Math.round(stayMinutes(stay) / 60)
  return Math.max(1, hours) * HOURLY_CENTS
}
