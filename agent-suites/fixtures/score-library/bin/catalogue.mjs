import { readFileSync } from 'node:fs'
import { catalogue } from '../src/catalogue.mjs'

const { pieces, loans } = JSON.parse(
  readFileSync(new URL('../data/library.json', import.meta.url), 'utf8'),
)
for (const row of catalogue(pieces, loans, '2026-10-21')) {
  const where = row.status === 'in' ? 'in' : `${row.status} (${row.borrower}, due ${row.due})`
  console.log(
    `${row.id.padEnd(7)} ${row.composer.padEnd(18)} ${row.title.padEnd(16)} ${String(row.timesLent).padStart(2)}x  ${where}`,
  )
}
