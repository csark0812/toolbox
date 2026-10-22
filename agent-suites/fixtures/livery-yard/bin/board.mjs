import { readFileSync } from 'node:fs'
import * as feeds from '../src/feeds.mjs'
import { loadHorses } from '../src/horses.mjs'

const { columns } = JSON.parse(
  readFileSync(new URL('../config/board.json', import.meta.url), 'utf8'),
)

const args = process.argv.slice(2)
let sort = null
let file
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--sort') sort = args[++i]
  else file = args[i]
}
if (sort && !columns.includes(sort)) {
  console.error(`board: no column ${sort} (have ${columns.join(', ')})`)
  process.exit(2)
}

// A column is a field of the horse or the feeds function of that name.
const value = (horse, column) => (column in horse ? horse[column] : feeds[column](horse))

const rows = loadHorses(file).map((horse) => columns.map((column) => value(horse, column)))
if (sort) {
  const at = columns.indexOf(sort)
  rows.sort((a, b) =>
    typeof a[at] === 'number' ? b[at] - a[at] : String(a[at]).localeCompare(String(b[at])),
  )
}
console.log(columns.map((c) => c.padEnd(12)).join(''))
for (const row of rows) console.log(row.map((v) => String(v ?? '—').padEnd(12)).join(''))
