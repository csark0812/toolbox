import { readFileSync } from 'node:fs'
import { fill, show } from '../src/show.mjs'

const [name = 'Guest', band = 'Adult'] = process.argv.slice(2)
const template = readFileSync(new URL('../templates/ticket.txt', import.meta.url), 'utf8')
process.stdout.write(fill(template, { name, band, venue: show.venue }))
