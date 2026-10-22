import { bagLabel, fleeceValue, gradeFleece, loadVisits } from '../src/shearing.mjs'

console.log('label,farm,date,grade,kg,pence')
for (const visit of loadVisits(process.argv[2])) {
  for (const animal of visit.animals) {
    if (animal.micron === null) continue
    const grade = gradeFleece(animal.micron)
    console.log(
      [
        bagLabel(visit, animal),
        visit.farm,
        visit.date,
        grade,
        animal.fleeceKg,
        fleeceValue(animal),
      ].join(','),
    )
  }
}
