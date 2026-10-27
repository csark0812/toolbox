// Development check for library fines: parseDate reads a real YYYY-MM-DD calendar date from 2000
// to 2099, accepting the edges (2099-12-31, leap days) and refusing the rest with a RangeError;
// --fines prints each overdue loan with exact whole-penny fines (15p a day from the day after the
// due date, at most £3.00) and the total, bad dates exit 2 with nothing on stdout, and the plain
// listing is unchanged.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseDate } = await import(pathToFileURL(join(dir, 'src/dates.mjs')).href)
for (const [text, year, month, day] of [
  ['2026-10-21', 2026, 10, 21],
  ['2000-01-01', 2000, 1, 1],
  ['2099-12-31', 2099, 12, 31],
  ['2028-02-29', 2028, 2, 29],
  ['2000-02-29', 2000, 2, 29],
  ['2026-04-30', 2026, 4, 30],
  ['2026-02-28', 2026, 2, 28],
])
  assert.deepEqual({ ...parseDate(text) }, { year, month, day }, JSON.stringify(text))
for (const bad of [
  '2026-02-29',
  '2100-01-01',
  '1999-12-31',
  '2026-04-31',
  '2026-13-01',
  '2026-00-10',
  '2026-10-00',
  '2026-10-32',
  '2026-1-05',
  '26-10-01',
  '21/10/2026',
  '',
  '2026-10-21T00:00',
]) {
  assert.throws(() => parseDate(bad), RangeError, JSON.stringify(bad))
  if (bad.trim())
    assert.throws(
      () => parseDate(bad),
      (error) => error.message.includes(bad),
      `the message quotes ${JSON.stringify(bad)}`,
    )
}
for (const bad of [20261021, null, undefined]) assert.throws(() => parseDate(bad), String(bad))
const cli = (...args) =>
  spawnSync(process.execPath, ['bin/loans.mjs', ...args], { cwd: dir, encoding: 'utf8' })
for (const [date, lines] of [
  [
    '2026-10-20',
    [
      'Ana Okoye: The Hobbit, 17 days, £2.55',
      'Ben Hart: Small Island, 22 days, £3.00',
      'Dev Rao: Dune, 51 days, £3.00',
      'Eli Stone: Beloved, 6 days, £0.90',
      'Total: £9.45',
    ],
  ],
  ['2026-09-18', ['Dev Rao: Dune, 19 days, £2.85', 'Total: £2.85']],
  ['2026-09-19', ['Dev Rao: Dune, 20 days, £3.00', 'Total: £3.00']],
  [
    '2026-10-01',
    ['Ben Hart: Small Island, 3 days, £0.45', 'Dev Rao: Dune, 32 days, £3.00', 'Total: £3.45'],
  ],
  ['2026-08-01', ['Total: £0.00']],
]) {
  const result = cli('--fines', date)
  assert.equal(result.stdout, `${lines.join('\n')}\n`, `--fines ${date}`)
  assert.equal(result.status, 0, `--fines ${date}`)
  assert.equal(result.stderr, '', `--fines ${date} writes nothing to stderr`)
}
for (const date of ['2099-12-31', '2028-02-29']) {
  const result = cli('--fines', date)
  assert.equal(result.status, 0, `--fines ${date} is a valid date`)
  assert.equal(result.stdout.split('\n').at(-2), 'Total: £15.00', `--fines ${date}`)
}
for (const bad of [
  ['--fines', '2026-02-29'],
  ['--fines', '2100-01-01'],
  ['--fines', '2026-04-31'],
  ['--fines', '21/10/2026'],
  ['--fines'],
]) {
  const result = cli(...bad)
  assert.equal(result.status, 2, bad.join(' '))
  assert.equal(result.stdout, '', bad.join(' '))
  assert.notEqual(result.stderr.trim(), '', bad.join(' '))
}
const plain = cli()
assert.equal(
  plain.stdout,
  'Ana Okoye: The Hobbit, due 2026-10-03\nBen Hart: Small Island, due 2026-09-28\nCleo Marsh: Persuasion, due 2026-10-20\nDev Rao: Dune, due 2026-08-30\nEli Stone: Beloved, due 2026-10-14\n',
)
assert.equal(plain.stderr, '', 'the plain listing writes nothing to stderr')
assert.equal(spawnSync(process.execPath, ['--test'], { cwd: dir }).status, 0, 'tests pass')
