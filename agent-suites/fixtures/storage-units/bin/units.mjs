import { readFileSync } from 'node:fs'
import { unitLine } from '../src/units.mjs'

const units = JSON.parse(readFileSync(new URL('../data/units.json', import.meta.url), 'utf8'))
for (const unit of units) console.log(unitLine(unit))
