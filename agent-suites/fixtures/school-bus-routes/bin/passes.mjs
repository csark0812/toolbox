import { readFileSync } from 'node:fs'
import { allocate, seatsUsed } from '../src/passes.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const pupils = read('pupils.json')
const routes = read('routes.json')
const outcomes = allocate(pupils, routes)
for (const { pupil, pass, reason } of outcomes)
  console.log(
    `${pupil.id}  ${pupil.name.padEnd(12)}  ${pupil.route}  ${pupil.miles.toFixed(1)} mi  ${pass ? 'pass' : `no pass: ${reason}`}`,
  )
const used = seatsUsed(outcomes)
for (const [route, { seats }] of Object.entries(routes))
  console.log(`route ${route}: ${used[route] ?? 0} of ${seats} seats`)
