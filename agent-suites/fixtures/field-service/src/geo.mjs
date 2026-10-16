// Routing maths and address formatting for call-outs.

const EARTH_KM = 6371

/** Great-circle distance between two { lat, lon } points, in km, one decimal. */
export function haversineKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2
  return Math.round(2 * EARTH_KM * Math.asin(Math.sqrt(h)) * 10) / 10
}

/** Van travel time for a distance: 60 km/h on average plus 10 minutes to park, rounded up to 5. */
export function travelMinutes(km) {
  return Math.ceil((km + 10) / 5) * 5
}

/** The full postal address, one line per part, empty parts left out. */
export function formatAddress(address) {
  return [address.line1, address.line2, address.town, `Co. ${address.county}`, address.eircode]
    .filter(Boolean)
    .join('\n')
}

/** A one-line address for lists and texts. */
export function shortAddress(address) {
  return `${address.line1}, ${address.town} ${address.eircode}`
}
