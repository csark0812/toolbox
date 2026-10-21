import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { ringable, sortTowers } from '../src/towers.mjs'

const towers = JSON.parse(readFileSync(new URL('../data/towers.json', import.meta.url), 'utf8'))
const ringers = Number(argv[2] ?? 6)
const list = sortTowers(towers, 'bells').filter((tower) => ringable(tower, ringers))
console.log(`${list.length} towers for ${ringers} ringers`)
for (const tower of list)
  console.log(`  ${tower.name} (${tower.bells ?? 'ring of 6, not surveyed'})`)
