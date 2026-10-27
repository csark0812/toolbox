import { readFileSync } from 'node:fs'
import { specimenLine } from '../src/specimens.mjs'

const specimens = JSON.parse(
  readFileSync(new URL('../data/specimens.json', import.meta.url), 'utf8'),
)
for (const specimen of specimens) console.log(specimenLine(specimen))
