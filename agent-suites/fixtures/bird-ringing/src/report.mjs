import { birds, encounters, sites, species } from './store.mjs'

/** The public report: one line per encounter, oldest first. */
export function publicReport() {
  return encounters()
    .toSorted((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .map((encounter) => {
      const bird = birds().find((entry) => entry.ring === encounter.ring)
      const site = sites().find((entry) => entry.id === encounter.site)
      const kind = species().find((entry) => entry.name === bird.species)
      const place = kind.schedule1 ? site.county : `${site.name}, ${site.county} (${site.gridRef})`
      return `${encounter.date} ${bird.species} ${encounter.ring} ${place}`
    })
}
