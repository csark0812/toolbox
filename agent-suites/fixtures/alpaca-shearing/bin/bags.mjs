// Bag tags for the fleece bags. Written before the co-op grades were in shearing.mjs.
import { farmFor, loadVisits } from '../src/shearing.mjs'

function gradeOf(micron) {
  if (micron === null) return 'ungraded'
  if (micron < 18) return 'royal'
  if (micron < 20) return 'superfine'
  if (micron < 23) return 'fine'
  if (micron < 26) return 'medium'
  if (micron < 30) return 'strong'
  return 'coarse'
}

for (const visit of loadVisits(process.argv[2])) {
  for (const animal of visit.animals) {
    const code = farmFor(visit).code
    console.log(
      `${code}-${animal.tag}\t${gradeOf(animal.micron)}\t${animal.fleeceKg.toFixed(2)}kg\t${visit.date}`,
    )
  }
}
