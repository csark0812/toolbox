// Hidden acceptance for durations and --longer-than: parseDuration accepts hours-then-minutes in
// the stated forms and rejects everything else with a RangeError quoting the text, and the
// passages command filters strictly, reports an empty result, and refuses bad values.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseDuration } = await import(pathToFileURL(join(dir, 'src/duration.mjs')).href)
for (const [text, minutes] of [
  ['45m', 45],
  ['2h', 120],
  ['1h30m', 90],
  ['1h 30m', 90],
  ['90m', 90],
  ['1h59m', 119],
  ['1m', 1],
  ['10h', 600],
])
  assert.equal(parseDuration(text), minutes, text)
for (const text of ['', '0m', '0h', '1h60m', '1h90m', '1.5h', '-5m', '30', 'm', '30m1h', 'h', '2x'])
  assert.throws(
    () => parseDuration(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/passages.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const all = [
  '2026-10-12  Lock 14  Kingfisher    09:05-09:22   17 min',
  '2026-10-12  Lock 14  Dawn Treader  09:40-10:31   51 min',
  '2026-10-12  Lock 15  Kingfisher    09:48-10:03   15 min',
  '2026-10-12  Lock 15  Slow Boat     11:10-13:25  135 min',
  '2026-10-13  Lock 14  Heron         08:30-09:00   30 min',
  '2026-10-13  Lock 16  Dawn Treader  10:15-11:45   90 min',
  '2026-10-13  Lock 16  Otter         12:00-12:30   30 min',
  '2026-10-14  Lock 15  Narrow Escape 14:00-16:00  120 min',
  '2026-10-14  Lock 14  Heron         16:20-16:31   11 min',
]
const lines = (...indexes) => indexes.map((i) => all[i]).join('\n') + '\n'
assert.equal(run().stdout, lines(0, 1, 2, 3, 4, 5, 6, 7, 8), 'no option lists everything')
assert.equal(run('--longer-than', '1h').stdout, lines(3, 5, 7))
assert.equal(run('--longer-than', '90m').stdout, lines(3, 7), 'strictly longer')
assert.equal(run('--longer-than', '1h 30m').stdout, lines(3, 7))
assert.equal(run('--longer-than', '30m').stdout, lines(1, 3, 5, 7))
const none = run('--longer-than', '3h')
assert.equal(none.status, 0)
assert.equal(none.stdout, 'No passages longer than 3h.\n')
for (const bad of [['--longer-than', '1.5h'], ['--longer-than', '0m'], ['--longer-than']]) {
  const result = run(...bad)
  assert.equal(result.status, 2, `${bad.join(' ')} exits 2`)
  assert.equal(result.stdout, '', `${bad.join(' ')} prints no passages`)
  assert.notEqual(result.stderr.trim(), '', `${bad.join(' ')} explains on stderr`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
