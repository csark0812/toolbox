#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { assign } from '../src/dispatch.mjs'
import { exportCsv } from '../src/export.mjs'
import { itinerary } from '../src/itinerary.mjs'

const read = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'))
const technicians = read('data/technicians.json')
const callouts = read('data/callouts.json')
const [command, arg] = argv.slice(2)
const out = (text) => stdout.write(`${text}\n`)

if (command === 'assign') {
  for (const { callout, tech, km } of assign(callouts, technicians))
    out(`${callout.id}  ${tech ? `${tech.name} (${km} km)` : 'waiting'}`)
} else if (command === 'route') {
  const tech = technicians.find((t) => t.id === arg || t.name === arg)
  if (!tech) {
    stderr.write(`no technician ${arg}\n`)
    exit(1)
  }
  const mine = assign(callouts, technicians)
    .filter((job) => job.tech?.id === tech.id)
    .map((job) => job.callout)
  if (!mine.length) out(`${tech.name} has no stops today`)
  for (const [i, leg] of itinerary(tech, mine).entries())
    out(
      `${i + 1}. ${leg.callout.id} ${leg.km} km, ${leg.minutes} min\n${leg.address.replace(/^/gm, '   ')}`,
    )
} else if (command === 'export') {
  out(exportCsv(callouts, technicians))
} else if (command === 'notify') {
  const job = assign(callouts, technicians).find((j) => j.callout.id === arg)
  if (!job?.tech) {
    stderr.write(`no technician assigned to ${arg}\n`)
    exit(1)
  }
  const { etaText } = await import('../src/notify.mjs')
  out(await etaText(job.callout, job.tech, job.km))
} else {
  stderr.write('usage: visits assign | route <tech> | export | notify <id>\n')
  exit(2)
}
