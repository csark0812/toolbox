import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { awardsFor, loadAwards } from '../src/awards.mjs'

const awards = loadAwards(readFileSync(new URL('../data/awards.json', import.meta.url), 'utf8'))
for (const award of awardsFor(awards, argv[2]))
  console.log(`${award.bc.padEnd(5)} ${award.nm.padEnd(22)} stage ${award.lvl}  ${award.at}`)
