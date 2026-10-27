export const PENCE_PER_MILE = 40

/** Total miles over a list of trips. */
export function totalMiles(trips) {
  return trips.reduce((sum, trip) => sum + trip.miles, 0)
}

/** Amount owed in pounds for a number of miles. */
export function charge(miles) {
  return (miles * PENCE_PER_MILE) / 100
}
