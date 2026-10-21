import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { describe, sortTowers } from '../src/towers.mjs'

const towers = JSON.parse(readFileSync(new URL('../data/towers.json', import.meta.url), 'utf8'))
const at = argv.indexOf('--sort')
const key = at === -1 ? 'name' : argv[at + 1]
for (const tower of sortTowers(towers, key)) console.log(describe(tower))
