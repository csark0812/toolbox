import { formatAddress, haversineKm, travelMinutes } from './geo.mjs'

/** Nearest-neighbour stop order from the technician's base, with travel per leg. */
export function itinerary(tech, callouts) {
  const left = [...callouts]
  const legs = []
  let here = tech.base
  while (left.length) {
    left.sort((a, b) => haversineKm(here, a.location) - haversineKm(here, b.location))
    const next = left.shift()
    const km = haversineKm(here, next.location)
    legs.push({
      callout: next,
      km,
      minutes: travelMinutes(km),
      address: formatAddress(next.address),
    })
    here = next.location
  }
  return legs
}
