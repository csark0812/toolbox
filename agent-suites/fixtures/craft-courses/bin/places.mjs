import { readFileSync } from 'node:fs'
import { enrol, placesTaken } from '../src/enrol.mjs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const courses = load('courses.json')
const rows = enrol(courses, load('signups.json'))

const label = {
  place: 'place',
  waiting: 'waiting list (course full)',
  duplicate: 'second form, already has a place',
}
for (const course of courses) {
  console.log(course.name)
  for (const row of rows.filter((r) => r.course === course.id))
    console.log(`  ${row.name.padEnd(14)}${label[row.status]}`)
}
console.log(
  `Places taken: ${placesTaken(courses, rows)
    .map((c) => `${c.name} ${c.taken} of ${c.places}`)
    .join(', ')}`,
)
