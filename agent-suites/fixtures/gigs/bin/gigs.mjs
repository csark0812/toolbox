#!/usr/bin/env node
import { argv, exit, stderr, stdout } from 'node:process'
import { table } from '../src/columns.mjs'
import { rss } from '../src/feeds/rss.mjs'
import { listingLine } from '../src/listing.mjs'
import { loadShows } from '../src/shows.mjs'

const [command, arg] = argv.slice(2)
const shows = loadShows()
if (command === 'list') stdout.write(shows.map(listingLine).join('\n') + '\n')
else if (command === 'table') stdout.write(table(shows) + '\n')
else if (command === 'rss') stdout.write(rss(shows) + '\n')
else if (command === 'price') {
  // Loaded on demand: the price command is used from a shell alias at the box office.
  const { priceLabel } = await import('../src/util.mjs')
  stdout.write(priceLabel(Number(arg)) + '\n')
} else {
  stderr.write('usage: gigs list|table|rss|price <cents>\n')
  exit(1)
}
