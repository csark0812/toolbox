const EARTH_KM = 6371

/** Great-circle distance between two [lat, lon] points, in km. */
export function distanceKm([lat1, lon1], [lat2, lon2]) {
  const rad = (degrees) => (degrees * Math.PI) / 180
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(a))
}

/** How well a job matches the search words: title hits count most, then tags, then the description. */
export function relevance(job, words) {
  let total = 0
  for (const word of words) {
    const w = word.toLowerCase()
    if (job.title.toLowerCase().includes(w)) total += 3
    if (job.tags.some((tag) => tag.includes(w))) total += 2
    if (job.description.toLowerCase().includes(w)) total += 1
  }
  return total
}

/** Matching jobs, nearest to `near` first, then best match first. Remote jobs have no place. */
export function search(jobs, text, { near, cities }) {
  const words = text.split(/\s+/).filter(Boolean)
  const home = cities[near]
  if (!home) throw new RangeError(`unknown city: ${near}`)
  return jobs
    .map((job) => ({
      ...job,
      match: relevance(job, words),
      distance: job.remote ? Infinity : distanceKm(home, cities[job.city]),
    }))
    .filter((job) => job.match > 0)
    .sort((a, b) => a.distance - b.distance || b.match - a.match)
}
