// Hidden acceptance for parseTime and --qualifiers: parseTime turns `m:ss.hh` and `s.hh` swim times
// into hundredths, gives null for NT in either case, refuses anything else with a RangeError quoting
// the text and non-strings with a TypeError; the swimmers command lists one event's qualifiers by
// age group on 31 December of the gala year, at or under the standard, fastest first with ties by
// name, skips the too young and NT, names unreadable times on stderr with `swim: `, exits 2 for a
// missing or unknown event, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseTime } = await import(pathToFileURL(join(dir, 'src/times.mjs')).href)
for (const [text, hundredths] of [
  ['1:05.32', 6532],
  ['58.90', 5890],
  ['7.25', 725],
  ['59.99', 5999],
  ['10.00', 1000],
  ['1:00.00', 6000],
  ['1:59.99', 11999],
  ['2:45.00', 16500],
  ['10:00.00', 60000],
  ['12:09.07', 72907],
  ['NT', null],
  ['nt', null],
])
  assert.equal(parseTime(text), hundredths, text)
for (const text of [
  '',
  '58',
  '58.9',
  '30.8',
  '58.900',
  '60.00',
  '75.10',
  '1:60.00',
  '1:5.00',
  '1:9.50',
  '1:05',
  '1:05.3',
  '0:58.90',
  '01:05.32',
  '05.32',
  '00.50',
  '+58.90',
  '-58.90',
  '5.89e1',
  ' 58.90',
  '58.90 ',
  '1:05.32.1',
  '1:05:32',
  '1;05.32',
  '1.05.32',
  '58,90',
  'N T',
  'NTT',
  'DQ',
  '１:05.32',
])
  assert.throws(
    () => parseTime(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
for (const value of [5890, null, undefined, ['58.90'], {}, true])
  assert.throws(() => parseTime(value), TypeError, `${String(value)} is refused with a TypeError`)

const run = (...args) =>
  spawnSync(process.execPath, ['bin/swimmers.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const squad = [
  ['Ava Brook', '2013-08-20'],
  ['Ben Carr', '2017-12-31'],
  ['Cleo Dunn', '2018-01-01'],
  ['Dan Ellis', '2014-05-02'],
  ['Esme Ford', '2014-02-14'],
  ['Finn Gray', '2010-07-07'],
  ['Gus Hale', '2011-03-03'],
  ['Hana Iqbal', '2012-12-31'],
  ['Ivy Jones', '2015-06-30'],
  ['Jai Khan', '2013-01-15'],
  ['Liam Moss', '2014-09-09'],
  ['Mia Nash', '2014-11-30'],
  ['Noor Owen', '2013-04-04'],
  ['Ola Park', '2014-12-31'],
].map(([name, born]) => `${name.padEnd(12)} ${born}`)
const plain = run()
assert.equal(plain.stdout, squad.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [event, lines, unreadable] of [
  [
    '50 free',
    [
      'Finn Gray  15+  28.90',
      'Hana Iqbal  13-14  30.12',
      'Mia Nash  11-12  32.05',
      'Esme Ford  11-12  34.50',
      'Ola Park  11-12  34.50',
      'Ben Carr  9-10  40.00',
      'Qualifiers: 6',
    ],
    ['Jai Khan'],
  ],
  [
    '  100 BACK ',
    [
      'Finn Gray  15+  59.99',
      'Hana Iqbal  13-14  1:14.50',
      'Mia Nash  11-12  1:21.99',
      'Esme Ford  11-12  1:22.00',
      'Qualifiers: 4',
    ],
    ['Gus Hale'],
  ],
  ['200 im', ['Qualifiers: 0'], []],
]) {
  const result = run('--qualifiers', event)
  assert.equal(result.status, 0, `--qualifiers ${event} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--qualifiers ${JSON.stringify(event)}`)
  const errors = stderrLines(result)
  for (const line of errors) assert.match(line, /^swim: /, 'stderr lines start with "swim: "')
  for (const name of unreadable)
    assert.ok(
      errors.some((line) => line.includes(name)),
      `${name}'s unreadable time is named on stderr`,
    )
  assert.equal(errors.length, unreadable.length, `only unreadable times are named for ${event}`)
}
for (const args of [['--qualifiers'], ['--qualifiers', '200 fly'], ['--qualifiers', '   ']]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^swim: /, 'stderr lines start with "swim: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
