import { readFileSync } from 'node:fs'
import { argv, exit } from 'node:process'
import { loadAwards, sortBy } from '../src/awards.mjs'
import { forSection } from '../src/sections.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const rule = JSON.parse(read('sections.json'))[argv[2]]
if (!rule) {
  console.error(`No section ${argv[2]}`)
  exit(1)
}
for (const award of sortBy(forSection(loadAwards(read('awards.json')), rule), 'lvl', 'scout'))
  console.log(`${award.scout}  ${award.bc}-${award.lvl}  ${award.nm}`)
