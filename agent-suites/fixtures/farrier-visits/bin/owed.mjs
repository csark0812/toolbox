import { loadVisits, owed } from '../src/diary.mjs'
import { pounds } from '../src/prices.mjs'

const unpaid = owed(loadVisits())
console.log('Owed')
for (const visit of unpaid)
  console.log(
    `  ${visit.date}  ${visit.horse.padEnd(9)}${visit.work.padEnd(7)}${pounds(visit.price)}`,
  )
console.log(`Total ${pounds(unpaid.reduce((sum, visit) => sum + visit.price, 0))}`)
