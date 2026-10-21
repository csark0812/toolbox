import { loadBasket, memberSaving, pounds } from '../src/money.mjs'

const member = process.argv.includes('--member')
const basket = loadBasket()
let total = 0
for (const { name, pence } of basket) {
  console.log(`  ${pounds(pence)} ${name}`)
  total += pence
}
console.log(`Subtotal ${pounds(total)}`)
if (member) {
  const saving = memberSaving(total)
  console.log(`Member -${pounds(saving)}`)
  total -= saving
}
console.log(`Total ${pounds(total)}`)
