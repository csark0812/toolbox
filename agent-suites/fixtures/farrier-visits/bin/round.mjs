import { loadHorses, round } from '../src/diary.mjs'
import { pounds } from '../src/prices.mjs'

const visits = round(loadHorses())
console.log('Round')
for (const visit of visits)
  console.log(
    `  ${visit.date}  ${visit.horse.padEnd(9)}${visit.yard.padEnd(20)}${visit.work.padEnd(7)}${pounds(visit.price)}`,
  )
console.log(`Total ${pounds(visits.reduce((sum, visit) => sum + visit.price, 0))}`)
