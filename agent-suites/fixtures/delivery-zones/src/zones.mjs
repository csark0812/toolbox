/** A zone's corners as [x, y] pairs. */
export function corners(zone) {
  return zone.boundary
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(',').map(Number))
}

/** Even-odd rule, casting a ray east from the point. */
export function contains(zone, [x, y]) {
  const points = corners(zone)
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

/** The first zone, in priority order, that contains the point, or null. */
export function zoneFor(zones, point) {
  for (const zone of zones) if (contains(zone, point)) return zone.id
  return null
}

/** The zone of every address. */
export function assignAll(zones, addresses) {
  return addresses.map((address) => ({ id: address.id, zone: zoneFor(zones, address.at) }))
}
