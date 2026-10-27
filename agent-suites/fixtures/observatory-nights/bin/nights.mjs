import { readFileSync } from 'node:fs'
import { nightLines } from '../src/print.mjs'
import { scheduleNight } from '../src/schedule.mjs'

const requests = JSON.parse(readFileSync(new URL('../data/requests.json', import.meta.url), 'utf8'))
const nights = [...new Set(requests.map((request) => request.night))].sort()
for (const night of nights) {
  const results = scheduleNight(requests.filter((request) => request.night === night))
  console.log(nightLines(night, results).join('\n'))
}
