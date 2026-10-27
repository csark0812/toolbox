import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { nightLines } from '../src/print.mjs'
import { scheduleNight } from '../src/schedule.mjs'

const requests = JSON.parse(readFileSync(new URL('../data/requests.json', import.meta.url), 'utf8'))
const night = argv[2]
const results = scheduleNight(requests.filter((request) => request.night === night))
console.log(nightLines(night, results).join('\n'))
