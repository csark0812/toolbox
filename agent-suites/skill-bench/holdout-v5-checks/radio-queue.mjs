// Hidden acceptance for the radio queue: tracks from the playout log played in the last hour are
// never queued (the log's ids are text, the library's are numbers), every other track still is,
// and the CLI output follows.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, file)).href)
const { parseHistory } = await load('src/history.mjs')
const { buildQueue } = await load('src/queue.mjs')
const library = JSON.parse(readFileSync(join(dir, 'data/library.json'), 'utf8'))
const title = (id) => library.find((track) => Number(track.id) === id).title
const log = readFileSync(join(dir, 'data/played.log'), 'utf8')
const queued = (at, extra = []) =>
  execFileSync(process.execPath, ['bin/queue.mjs', '--at', at, ...extra], {
    cwd: dir,
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .map((line) => line.replace(/^\s*\d+\.\s*/, '').replace(/ - .*$/, ''))
const eligibleAt10 = [104, 105, 106, 107, 108, 111, 112].map(title).sort()
for (const seed of ['1', '7', '42'])
  assert.deepEqual(
    queued('2026-10-16T10:00:00Z', ['--seed', seed]).sort(),
    eligibleAt10,
    `queue at 10:00 (seed ${seed}) holds exactly the tracks not played since 09:00`,
  )
const later = queued('2026-10-16T10:40:00Z', ['--length', '20'])
assert.equal(later.length, 11, 'at 10:40 only Saltwater Hymn (09:47) is recent')
assert.ok(!later.includes(title(110)))
const eight = queued('2026-10-16T10:40:00Z')
assert.equal(eight.length, 8)
assert.equal(new Set(eight).size, 8)

// The library API with the parsed log, for any seed.
const plays = parseHistory(log)
for (let seed = 1; seed <= 25; seed++) {
  const queue = buildQueue(library, plays, {
    now: new Date('2026-10-16T09:50:00Z'),
    seed,
    length: 50,
  })
  const ids = queue.map((track) => Number(track.id)).sort((a, b) => a - b)
  assert.deepEqual(ids, [104, 105, 106, 107, 108, 111], `seed ${seed}`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
