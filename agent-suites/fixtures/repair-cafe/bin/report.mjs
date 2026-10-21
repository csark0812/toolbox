import { readFileSync } from 'node:fs'
import { report } from '../src/report.mjs'

const repairs = JSON.parse(readFileSync(new URL('../data/repairs.json', import.meta.url), 'utf8'))
for (const line of report(repairs)) console.log(line)
