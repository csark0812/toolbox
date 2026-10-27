import { readFileSync } from 'node:fs'
import { hireLine } from '../src/hires.mjs'

const hires = JSON.parse(readFileSync(new URL('../data/hires.json', import.meta.url), 'utf8'))
for (const hire of hires) console.log(hireLine(hire))
