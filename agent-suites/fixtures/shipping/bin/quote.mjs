import { argv } from 'node:process'
import { quote } from '../src/rates.mjs'

const [kg, l, w, h, zone, service] = argv.slice(2)
if (!zone) {
  console.error('usage: quote <kg> <l> <w> <h> <zone> [express]')
  process.exit(2)
}
const cents = quote(Number(kg), Number(l), Number(w), Number(h), zone, service === 'express')
console.log(`$${(cents / 100).toFixed(2)}`)
