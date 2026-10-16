// The gazetteer: every named place the travel desk uses, with coordinates. The real list comes
// from a licensed export; this build generates a stand-in of the same size.
const SYLLABLES = ['ka', 'lo', 'mi', 'ra', 'to', 'san', 'vel', 'or', 'ne', 'qui', 'bar', 'dun']

function buildPlaces() {
  const places = []
  let seed = 1234567
  const next = () => (seed = (seed * 48271) % 2147483647)
  for (let i = 0; i < 300000; i++) {
    let name = ''
    for (let s = 0; s < 2 + (next() % 3); s++) name += SYLLABLES[next() % SYLLABLES.length]
    places.push({
      name: name[0].toUpperCase() + name.slice(1),
      lat: ((next() % 1800000) - 900000) / 10000,
      lon: ((next() % 3600000) - 1800000) / 10000,
    })
  }
  return places.sort((a, b) => a.lat - b.lat || a.lon - b.lon)
}

export const PLACES = buildPlaces()
