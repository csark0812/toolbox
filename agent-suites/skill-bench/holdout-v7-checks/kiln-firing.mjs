// Hidden acceptance for the helpers split: the three functions live under their new names in
// src/firing/, helpers.mjs and every old name are gone (including the package import alias and
// the name table that picks segment durations), and every command prints what it did before.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.ok(!existsSync(join(dir, 'src/helpers.mjs')), 'src/helpers.mjs is deleted')
const segments = await import(pathToFileURL(join(dir, 'src/firing/segments.mjs')).href)
const time = await import(pathToFileURL(join(dir, 'src/firing/time.mjs')).href)
assert.equal(segments.rampMinutes({ to: 1222, rate: 60 }, 1160), 62)
assert.equal(segments.rampMinutes({ to: 100, rate: 7 }, 20), 686)
assert.equal(segments.rampMinutes({ to: 50, rate: 100 }, 100), 30, 'cooling ramps count too')
assert.equal(segments.holdMinutes({ minutes: 15 }), 15)
assert.equal(time.formatMinutes(425), '7h 05m')
assert.equal(time.formatMinutes(655), '10h 55m')
for (const old of ['calcRamp', 'calcHold', 'fmtMinutes'])
  assert.ok(!(old in segments) && !(old in time), `no ${old} alias is exported`)

const walk = (folder) =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
const sources = [
  ...['src', 'bin', 'tests'].flatMap((folder) => walk(join(dir, folder))),
  join(dir, 'package.json'),
]
for (const file of sources)
  assert.doesNotMatch(
    readFileSync(file, 'utf8'),
    /calcRamp|calcHold|fmtMinutes|helpers\.mjs/,
    `${file} still names the old helpers`,
  )

const run = (args) => {
  const result = spawnSync(process.execPath, ['bin/kiln.mjs', ...args], {
    cwd: dir,
    encoding: 'utf8',
  })
  return result.stdout + result.stderr
}
for (const [args, want] of [
  [
    ['plan', 'bisque'],
    'bisque from 18:00\n  ramp to 100\u00b0C at 60\u00b0C/h     1h 20m  until 19:20\n  hold                        1h 00m  until 20:20\n  ramp to 600\u00b0C at 100\u00b0C/h    5h 00m  until 01:20\n  ramp to 1000\u00b0C at 150\u00b0C/h   2h 40m  until 04:00\n  hold                        0h 10m  until 04:10\n',
  ],
  [
    ['plan', 'glaze', '07:30'],
    'glaze from 07:30\n  ramp to 600\u00b0C at 150\u00b0C/h    3h 52m  until 11:22\n  ramp to 1160\u00b0C at 200\u00b0C/h   2h 48m  until 14:10\n  ramp to 1222\u00b0C at 60\u00b0C/h    1h 02m  until 15:12\n  hold                        0h 15m  until 15:27\n',
  ],
  [
    ['plan', 'lustre', '23:15'],
    'lustre from 23:15\n  ramp to 400\u00b0C at 120\u00b0C/h    3h 10m  until 02:25\n  ramp to 740\u00b0C at 200\u00b0C/h    1h 42m  until 04:07\n  hold                        0h 05m  until 04:12\n',
  ],
  [
    ['log'],
    '2026-10-02  bisque   10h 55m  Nell\n2026-10-06  glaze     8h 18m  Omar\n2026-10-09  lustre    5h 15m  Nell\n2026-10-13  glaze     8h 32m  Omar\n',
  ],
  [['total', 'glaze'], 'glaze: 7h 57m\n'],
  [['total', 'bisque'], 'bisque: 10h 10m\n'],
  [['plan', 'raku'], 'kiln: no program called raku\n'],
  [['plan', 'glaze', '7pm'], 'kiln: start time must be HH:MM, got 7pm\n'],
])
  assert.equal(run(args), want, `kiln ${args.join(' ')}`)
assert.equal(spawnSync(process.execPath, ['bin/kiln.mjs', 'plan', 'raku'], { cwd: dir }).status, 1)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
