import assert from 'node:assert/strict'
import { test } from 'node:test'
import { enrol, placesTaken } from '../src/enrol.mjs'

const courses = [{ id: 'clay', name: 'Clay', places: 2 }]

test('places go in sign-up order until the course is full', () => {
  const rows = enrol(courses, [
    { name: 'Ann', course: 'clay', at: '2026-09-01T18:00' },
    { name: 'Bo', course: 'clay', at: '2026-09-01T18:30' },
    { name: 'Cy', course: 'clay', at: '2026-09-01T19:00' },
  ])
  assert.deepEqual(
    rows.map((r) => [r.name, r.status]),
    [
      ['Ann', 'place'],
      ['Bo', 'place'],
      ['Cy', 'waiting'],
    ],
  )
  assert.deepEqual(placesTaken(courses, rows), [{ name: 'Clay', taken: 2, places: 2 }])
})
