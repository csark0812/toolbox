import { readFileSync } from 'node:fs'
import { basePrice, money } from '../src/prices.mjs'

const screenings = JSON.parse(
  readFileSync(new URL('../data/screenings.json', import.meta.url), 'utf8'),
)
for (const screening of screenings)
  console.log(
    `${screening.date} ${screening.time}  ${screening.film.padEnd(16)}${money(basePrice(screening))}`,
  )
