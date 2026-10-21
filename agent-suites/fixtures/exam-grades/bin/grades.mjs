import { readFileSync } from 'node:fs'
import { gradeFor, parseMarks, percentage } from '../src/grades.mjs'

const candidates = parseMarks(readFileSync(new URL('../data/marks.csv', import.meta.url), 'utf8'))
for (const candidate of candidates) {
  const percent = percentage(candidate)
  console.log(
    `${candidate.candidate}  ${candidate.name.padEnd(12)}${percent.toFixed(1).padStart(5)}%  ${gradeFor(percent)}`,
  )
}
