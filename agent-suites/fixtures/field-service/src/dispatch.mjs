import { haversineKm } from './geo.mjs'

/** Give each call-out, in order, to the nearest technician who has no job yet; later ones wait. */
export function assign(callouts, technicians) {
  const free = new Set(technicians.map((tech) => tech.id))
  return callouts.map((callout) => {
    const options = technicians
      .filter((tech) => free.has(tech.id))
      .map((tech) => ({ tech, km: haversineKm(tech.base, callout.location) }))
      .sort((a, b) => a.km - b.km || (a.tech.id < b.tech.id ? -1 : 1))
    const best = options[0]
    if (!best) return { callout, tech: null, km: null }
    free.delete(best.tech.id)
    return { callout, tech: best.tech, km: best.km }
  })
}
