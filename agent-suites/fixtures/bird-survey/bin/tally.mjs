#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { parseCsv, toSighting } from '../src/csv.mjs'
import { report, tally } from '../src/tally.mjs'

const args = argv.slice(2)
const file = args.find((arg, i) => !arg.startsWith('--') && args[i - 1] !== '--site')
const siteAt = args.indexOf('--site')
const site = siteAt === -1 ? undefined : args[siteAt + 1]
if (!file) {
  stderr.write('usage: tally <csv> [--site <site>]\n')
  exit(2)
}
const sightings = parseCsv(readFileSync(file, 'utf8')).map(toSighting)
const totals = tally(site ? sightings.filter((s) => s.site === site) : sightings)
if (!totals.size) stdout.write('no sightings\n')
for (const line of report(totals)) stdout.write(`${line}\n`)
