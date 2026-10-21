import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { loadAwards } from '../src/awards.mjs'
import { censusCsv } from '../src/census.mjs'

const awards = loadAwards(readFileSync(new URL('../data/awards.json', import.meta.url), 'utf8'))
stdout.write(censusCsv(awards))
