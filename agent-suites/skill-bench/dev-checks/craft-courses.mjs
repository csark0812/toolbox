// Development check for the craft courses: places go in sign-up order, a second form from
// someone who already has a place takes no place, the data is untouched and tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (name) => JSON.parse(readFileSync(join(dir, 'data', name), 'utf8'))
const courses = load('courses.json')
const signups = load('signups.json')
assert.deepEqual(
  signups.map((s) => `${s.name} ${s.at}`),
  [
    'Sam Reyes 2026-09-02T10:15',
    'Lena Okafor 2026-09-01T19:20',
    'Ravi Shah 2026-09-01T20:05',
    'Tom Ward 2026-09-02T11:00',
    'Mia Chen 2026-09-01T21:30',
    'Lena Okafor 2026-09-02T08:00',
    'Jo Park 2026-09-02T09:58',
    'Ada Byrne 2026-09-02T12:40',
    'Kit Moss 2026-09-03T09:10',
    'Ben Ito 2026-09-03T10:00',
  ],
  'the sign-up export is left as the form wrote it',
)
const { enrol } = await import(pathToFileURL(join(dir, 'src/enrol.mjs')).href)
const rows = enrol(courses, signups)
const placed = (course) =>
  rows.filter((r) => r.course === course && r.status === 'place').map((r) => r.name)
assert.deepEqual(placed('pottery').sort(), ['Jo Park', 'Mia Chen', 'Ravi Shah'])
assert.deepEqual(placed('watercolour').sort(), ['Ada Byrne', 'Kit Moss', 'Lena Okafor', 'Tom Ward'])
const out = execFileSync(process.execPath, ['bin/places.mjs'], { cwd: dir, encoding: 'utf8' })
assert.match(out, /Places taken: Pottery 3 of 3, Watercolour 4 of 4/)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
