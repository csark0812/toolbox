// Hidden acceptance for the run-log formatter merge: formatDistance(meters, unit) and
// formatPace(seconds, meters, unit) replace the four unit-specific helpers, none of the old names
// survive (including the template token table and the share card's computed lookup), and every
// command prints exactly what it printed before in both units.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const format = await import(pathToFileURL(join(dir, 'src/format.mjs')).href)
for (const old of ['formatKm', 'formatMiles', 'paceKm', 'paceMiles'])
  assert.equal(format[old], undefined, `src/format.mjs no longer exports ${old}`)
assert.equal(format.formatDistance(5210, 'km'), '5.21 km')
assert.equal(format.formatDistance(5210, 'mi'), '3.24 mi')
assert.equal(format.formatDistance(1609.344, 'mi'), '1.00 mi')
assert.equal(format.formatPace(1623, 5210, 'km'), '5:12 /km')
assert.equal(format.formatPace(1623, 5210, 'mi'), '8:21 /mi')
assert.equal(format.formatPace(3600, 10000, 'km'), '6:00 /km')
assert.equal(format.formatDuration(7445), '2:04:05')
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of ['src', 'bin', 'tests'].flatMap((sub) => walk(join(dir, sub))))
  assert.doesNotMatch(
    readFileSync(file, 'utf8'),
    /\b(formatKm|formatMiles|paceKm|paceMiles)\b|`(format|pace)\$\{/,
    `old helper name left in ${file}`,
  )
const GOLDEN = {
  summary: '4 runs, 39.35 km in 3:44:41\naverage pace 5:43 /km\nlongest: 2026-10-10, 21.10 km\n',
  'summary --units mi':
    '4 runs, 24.45 mi in 3:44:41\naverage pace 9:11 /mi\nlongest: 2026-10-10, 13.11 mi\n',
  'splits r2':
    'lap 1: 1.61 km at 5:30 /km\nlap 2: 1.61 km at 5:30 /km\nlap 3: 1.61 km at 5:30 /km\nlap 4: 1.61 km at 5:30 /km\nlap 5: 1.61 km at 5:30 /km\nlap 6: 1.61 km at 5:30 /km\nlap 7: 0.39 km at 5:30 /km\n',
  'splits r1 --units mi':
    'lap 1: 0.62 mi at 8:21 /mi\nlap 2: 0.62 mi at 8:21 /mi\nlap 3: 0.62 mi at 8:21 /mi\nlap 4: 0.62 mi at 8:21 /mi\nlap 5: 0.62 mi at 8:21 /mi\nlap 6: 0.13 mi at 8:21 /mi\n',
  'splits r4': 'lap 1: 3.00 km at 6:07 /km\n',
  weekly:
    'Hi Mei,\n\nThis week: 4 runs, 39.35 km (24.45 mi) in 3:44:41.\nAverage pace 5:43 /km, or 9:11 /mi if you think in miles.\n\nKeep it up!\n',
  'weekly --units mi':
    'Hi Mei,\n\nThis week: 4 runs, 39.35 km (24.45 mi) in 3:44:41.\nAverage pace 5:43 /km, or 9:11 /mi if you think in miles.\n\nKeep it up!\n',
  'share r3': '2026-10-10: ran 21.10 km in 2:04:05 (5:53 /km)\n',
  'share r3 --units mi': '2026-10-10: ran 13.11 mi in 2:04:05 (9:28 /mi)\n',
  'share r4 --units mi': '2026-10-12: ran 1.86 mi in 18:21 (9:51 /mi)\n',
}
for (const [args, want] of Object.entries(GOLDEN))
  assert.equal(
    execFileSync(process.execPath, ['bin/runlog.mjs', ...args.split(' ')], {
      cwd: dir,
      encoding: 'utf8',
    }),
    want,
    `runlog ${args}`,
  )
assert.equal(
  readFileSync(join(dir, 'templates/weekly.txt'), 'utf8'),
  'Hi {name},\n\nThis week: {runs} runs, {distance_km} ({distance_mi}) in {time}.\nAverage pace {pace_km}, or {pace_mi} if you think in miles.\n\nKeep it up!\n',
  'the email template users edit keeps its tokens',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
