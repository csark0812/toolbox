import { readFileSync } from 'node:fs'
import { formatTime, results } from '../src/results.mjs'

const { courses, runners } = JSON.parse(
  readFileSync(new URL('../data/event.json', import.meta.url), 'utf8'),
)
for (const { course, results: rows } of results(courses, runners)) {
  console.log(`${course} (${rows.length})`)
  for (const row of rows) {
    const place = row.place ? String(row.place).padStart(3) : '   '
    const time = row.time === null ? row.status : formatTime(row.time)
    const behind = row.behind ? `+${formatTime(row.behind)}` : ''
    const splits = row.splits
      .map((split) => `${formatTime(split.time)}${split.rank ? ` (${split.rank})` : ''}`)
      .join('  ')
    console.log(
      `${place}  ${row.name.padEnd(12)} ${row.club.padEnd(6)} ${time.padStart(7)} ${behind.padEnd(7)} ${splits}`,
    )
  }
}
