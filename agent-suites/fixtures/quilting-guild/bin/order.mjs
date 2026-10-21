import { readFileSync } from 'node:fs'
import { calc_backing } from '../src/fabric.mjs'
import { backingOrder } from '../src/order.mjs'

const patterns = JSON.parse(readFileSync(new URL('../data/patterns.json', import.meta.url), 'utf8'))
console.log('Backing order')
for (const quilt of patterns)
  console.log(`  ${quilt.name.padEnd(20)}${calc_backing(quilt).toFixed(2)} yd`)
console.log(`  ${'Total'.padEnd(20)}${backingOrder(patterns).toFixed(2)} yd`)
