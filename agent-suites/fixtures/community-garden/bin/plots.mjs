import { readFileSync } from 'node:fs'
import { billLine } from '../src/bills.mjs'

const plots = JSON.parse(readFileSync(new URL('../data/plots.json', import.meta.url), 'utf8'))
for (const plot of plots) console.log(billLine(plot))
