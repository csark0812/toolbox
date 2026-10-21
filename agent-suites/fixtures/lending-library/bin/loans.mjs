import { loadLoans } from '../src/loans.mjs'

for (const { member, title, due } of loadLoans()) console.log(`${member}: ${title}, due ${due}`)
