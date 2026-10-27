import assert from 'node:assert/strict'
import { test } from 'node:test'
import { taskLines } from '../src/tasks.mjs'

const task = {
  id: 'T7',
  date: '2026-07-18',
  name: '212 km triangle',
  entries: [
    { pilot: 'Ann Lee', comp: 'LA', glider: 'LS8', elapsed: '2:30:00' },
    { pilot: 'Sam Hart', comp: 'SH', glider: 'Discus 2b', elapsed: 'dnf' },
  ],
}

test('a task day shows its heading and one line per pilot', () => {
  assert.deepEqual(taskLines(task), [
    'T7  2026-07-18  212 km triangle  (2 pilots)',
    '  LA  Ann Lee      LS8        2:30:00',
    '  SH  Sam Hart     Discus 2b  dnf',
  ])
})
