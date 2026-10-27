import { birds, encounters, species } from './store.mjs'

/** Records a catch; a ring we haven't seen before is a newly ringed bird. */
export function addEncounter({ ring, species: name, date, time, site, ringer, wingMm, weightG }) {
  if (!species().some((entry) => entry.name === name)) throw new Error(`unknown species: ${name}`)
  const bird = birds().find((entry) => entry.ring === ring)
  if (!bird) birds().push({ ring, species: name, ringedOn: date })
  else if (bird.species !== name) throw new Error(`${ring} is a ${bird.species}, not a ${name}`)
  const encounter = {
    id: `e-${encounters().length + 1}`,
    ring,
    date,
    time,
    site,
    ringer,
    wingMm,
    weightG,
    submitted: false,
  }
  encounters().push(encounter)
  return encounter
}

/** Every encounter of one bird, oldest first. */
export function historyOf(ring) {
  return encounters()
    .filter((entry) => entry.ring === ring)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
}
