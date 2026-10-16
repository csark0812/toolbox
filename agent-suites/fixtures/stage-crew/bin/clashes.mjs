#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { stdout } from 'node:process'
import { clashes } from '../src/clashes.mjs'

const rota = JSON.parse(readFileSync(new URL('../data/rota.json', import.meta.url), 'utf8'))
const byId = new Map(rota.map((shift) => [shift.id, shift]))
const list = clashes(rota)
if (!list.length) stdout.write('No clashes.\n')
for (const { person, first, second } of list) {
  const a = byId.get(first)
  const b = byId.get(second)
  stdout.write(
    `${person}: ${first} ${a.stage} ${a.start.slice(5)}-${a.end.slice(11)} overlaps ${second} ${b.stage} ${b.start.slice(5)}-${b.end.slice(11)}\n`,
  )
}
