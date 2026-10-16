import { distanceKm } from '../geo.mjs'
import { PLACES } from '../gazetteer.mjs'

export const summary = 'nearest <lat> <lon>       nearest place in the gazetteer'
export function run([lat, lon]) {
  const here = { lat: Number(lat), lon: Number(lon) }
  let best = PLACES[0]
  for (const place of PLACES) if (distanceKm(here, place) < distanceKm(here, best)) best = place
  return [`${best.name} (${best.lat}, ${best.lon}), ${distanceKm(here, best).toFixed(1)} km away`]
}
