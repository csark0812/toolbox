import { invoice, loadVisits, pounds } from '../src/shearing.mjs'

const [ref, file] = process.argv.slice(2)
const visit = loadVisits(file).find((v) => v.ref === ref)
if (!visit) {
  console.error(`No visit ${ref}`)
  process.exit(1)
}
const { farm, lines, total } = invoice(visit)
console.log(`${farm.name} — ${visit.ref} — ${visit.date}`)
for (const [text, pence] of lines) console.log(`  ${text.padEnd(32)}${pounds(pence).padStart(10)}`)
console.log(`  ${'Total'.padEnd(32)}${pounds(total).padStart(10)}`)
