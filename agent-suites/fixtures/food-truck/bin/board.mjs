import { readFileSync } from 'node:fs'
import { boardLine } from '../src/menu.mjs'

const menu = JSON.parse(readFileSync(new URL('../data/menu.json', import.meta.url), 'utf8'))
for (const item of menu) console.log(boardLine(item))
