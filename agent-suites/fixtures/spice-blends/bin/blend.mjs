import { findBlend, loadBlends } from '../src/blends.mjs'

const name = process.argv.slice(2).join(' ')
const recipe = findBlend(loadBlends(), name)
if (!recipe) {
  console.error(`No blend called "${name}"`)
  process.exit(1)
}
console.log(name)
for (const { spice, amount } of recipe) console.log(`  ${amount} ${spice}`)
