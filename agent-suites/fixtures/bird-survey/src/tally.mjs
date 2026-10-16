/** Drops double submissions from the survey app. */
export function dedupe(sightings) {
  const seen = new Set()
  return sightings.filter((s) => {
    const key = `${s.site}|${s.observer}|${s.species}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Season totals: site -> species -> birds counted. */
export function tally(sightings) {
  const sites = new Map()
  for (const s of dedupe(sightings)) {
    const species = sites.get(s.site) ?? new Map()
    species.set(s.species, (species.get(s.species) ?? 0) + s.count)
    sites.set(s.site, species)
  }
  return sites
}

/** Report lines for each site, largest totals first, then by name. */
export function report(totals) {
  const lines = []
  for (const site of [...totals.keys()].sort()) {
    lines.push(`Site ${site}`)
    const rows = [...totals.get(site)].sort(([a, x], [b, y]) => y - x || a.localeCompare(b))
    for (const [species, count] of rows) lines.push(`  ${String(count).padStart(4)}  ${species}`)
  }
  return lines
}
