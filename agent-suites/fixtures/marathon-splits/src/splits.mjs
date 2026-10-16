import { seconds } from './clock.mjs'

/** Each runner's crossing of each mat, as seconds since midnight: Map bib -> Map mat -> s. */
export function readMats(csv) {
  const crossings = new Map()
  for (const line of csv.trim().split('\n').slice(1)) {
    const [bib, mat, time] = line.split(',')
    if (!crossings.has(bib)) crossings.set(bib, new Map())
    crossings.get(bib).set(mat, seconds(time))
  }
  return crossings
}

/** Start mat to finish mat. */
export function chipTime(race, mats) {
  return mats.get('finish') - mats.get('start')
}

/** Time for each stretch between consecutive mats, with its distance. */
export function splits(race, mats) {
  const result = []
  let previous = seconds(race.gun)
  for (let i = 1; i < race.mats.length; i++) {
    const mat = race.mats[i]
    const at = mats.get(mat.id)
    result.push({
      from: race.mats[i - 1].label,
      to: mat.label,
      seconds: at - previous,
      km: mat.km - race.mats[i - 1].km,
    })
    previous = at
  }
  return result
}
