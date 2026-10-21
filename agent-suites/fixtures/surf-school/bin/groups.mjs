import { readFileSync } from 'node:fs'
import { groups } from '../src/groups.mjs'

const pupils = JSON.parse(readFileSync(new URL('../data/pupils.json', import.meta.url), 'utf8'))
for (const line of groups(pupils)) console.log(line)
