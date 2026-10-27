import { readFileSync } from 'node:fs'
import { donated, pounds, takings } from '../src/sales.mjs'

const sales = JSON.parse(readFileSync(new URL('../data/sales.json', import.meta.url), 'utf8'))
const given = takings(donated(sales))
const total = takings(sales)
console.log(`Donated goods  ${pounds(given)}`)
console.log(`New goods      ${pounds(total - given)}`)
console.log(`Total          ${pounds(total)}`)
