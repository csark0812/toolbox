#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import Catalog from '../src/catalog.mjs'
import { labels } from '../src/labels.mjs'
import { seasonReport } from '../src/report.mjs'

const SEASON = 2026
// Lookup commands map straight onto catalogue methods.
const LOOKUPS = { find: 'search', family: 'byFamily' }
const show = (entry) =>
  `${entry.variety} (${entry.family}, ${entry.year}, from ${entry.donor}): ${entry.packets}`
const [command, ...args] = argv.slice(2)
try {
  if (LOOKUPS[command]) {
    const found = Catalog[LOOKUPS[command]](args.join(' '))
    stdout.write(found.length ? `${found.map(show).join('\n')}\n` : 'nothing found\n')
  } else if (command === 'add') {
    const [variety, family, donor, year, packets] = args
    const entry = Catalog.add({
      variety,
      family,
      donor,
      year: Number(year),
      packets: Number(packets),
    })
    stdout.write(`${show(entry)}\n`)
  } else if (command === 'take') {
    const left = Catalog.withdraw(args[0], Number(args[1]))
    stdout.write(`${left} packets of ${args[0]} left\n`)
  } else if (command === 'report') stdout.write(`${(await seasonReport(SEASON)).join('\n')}\n`)
  else if (command === 'labels') stdout.write(`${labels(Catalog.all()).join('\n')}\n`)
  else {
    stderr.write('usage: seeds <find|family|add|take|report|labels> ...\n')
    exit(2)
  }
} catch (error) {
  stderr.write(`${error.message}\n`)
  exit(1)
}
