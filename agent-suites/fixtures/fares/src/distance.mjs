/**
 * Approximate road distance in km between two { lat, lon } points: an equirectangular
 * projection times a 1.3 detour factor. Good enough inside one city.
 */
export function roadKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180
  const x = rad(b.lon - a.lon) * Math.cos(rad((a.lat + b.lat) / 2))
  const y = rad(b.lat - a.lat)
  return Math.round(Math.sqrt(x * x + y * y) * 6371 * 1.3 * 10) / 10
}
