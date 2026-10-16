// Hidden acceptance for the date formatter merge: one formatDate in src/dates.mjs for calendar
// strings and UTC-midnight Dates, neither old formatter left, and every letter, run sheet and
// report byte-for-byte the same.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { formatDate } = await import(pathToFileURL(join(dir, 'src/dates.mjs')).href)
assert.equal(typeof formatDate, 'function', 'src/dates.mjs exports formatDate')
assert.equal(formatDate('2026-11-04'), 'Wed 4 Nov 2026')
assert.equal(formatDate('2028-02-29'), 'Tue 29 Feb 2028')
assert.equal(formatDate(new Date('2026-12-25T00:00:00Z')), 'Fri 25 Dec 2026')

const OUTPUTS = {
  'letters.mjs 2026-11': 'f4617454bf304996',
  'letters.mjs 2026-10': '7ab13115cce54aa2',
  'letters.mjs 2026-12': '2770897d40a3746a',
  'runsheet.mjs 2026-11-04': '887fdbb0bb20e9cc',
  'runsheet.mjs 2026-11-27': 'e169d88c2914abff',
  'report.mjs 2026-11': 'dc0233c3ea586413',
  'report.mjs 2026-12': 'e2cf04e913c69c6b',
}
for (const [command, hash] of Object.entries(OUTPUTS)) {
  const [script, arg] = command.split(' ')
  const out = execFileSync(process.execPath, [`bin/${script}`, arg], { cwd: dir, encoding: 'utf8' })
  assert.equal(
    createHash('sha256').update(out).digest('hex').slice(0, 16),
    hash,
    `${command} prints exactly what it printed before:\n${out}`,
  )
}

const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
const code = ['src', 'bin', 'tests']
  .filter((folder) => existsSync(join(dir, folder)))
  .flatMap((folder) => walk(join(dir, folder)))
  .filter((file) => file.endsWith('.mjs'))
for (const file of code) {
  const text = readFileSync(file, 'utf8')
  assert.doesNotMatch(
    text,
    /export\s+(async\s+)?(function|const|let)\s+(fmtDate|formatDay)\b/,
    `${file} still defines an old formatter`,
  )
  assert.doesNotMatch(
    text,
    /import\s*\{[^}]*\b(fmtDate|formatDay)\b[^}]*\}\s*from/,
    `${file} still imports an old formatter`,
  )
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
