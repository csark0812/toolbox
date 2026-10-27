// Hidden acceptance for parseElapsed and --results: parseElapsed reads m:ss under an hour and h:mm:ss
// from an hour up, with no leading zero on the first number and two-digit parts below 60, from one
// second to just under eight hours, gives DNF, DNS and DSQ in capitals from any case, refuses anything
// else with a RangeError quoting the text and non-strings with a TypeError; the tasks command scores a
// task day by handicapped time (elapsed × index ÷ 100, half a second up), shares tied places with
// averaged points, lists non-finishers after in entry order with launched + 1 or entries + 1 points,
// leaves out and names unknown gliders and unreadable times on stderr, matches the id in any case
// with spaces trimmed, exits 2 for a missing or unknown id, writes `glide: ` on every stderr line, and
// is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseElapsed } = await import(pathToFileURL(join(dir, 'src/elapsed.mjs')).href)
for (const [text, value] of [
  ['47:12', 2832],
  ['0:01', 1],
  ['0:58', 58],
  ['9:05', 545],
  ['59:59', 3599],
  ['1:00:00', 3600],
  ['1:00:01', 3601],
  ['2:30:25', 9025],
  ['3:09:09', 11349],
  ['7:59:59', 28799],
  ['DNF', 'DNF'],
  ['dnf', 'DNF'],
  ['Dns', 'DNS'],
  ['DNS', 'DNS'],
  ['dsq', 'DSQ'],
  ['DsQ', 'DSQ'],
])
  assert.equal(parseElapsed(text), value, text)
for (const text of [
  '',
  '0:00',
  '0:00:00',
  '00:58',
  '05:00',
  '60:00',
  '61:10',
  '99:00',
  '47:5',
  '47:60',
  '47:123',
  '2:7:15',
  '2:07:5',
  '0:47:12',
  '01:00:00',
  '1:60:00',
  '1:00:60',
  '8:00:00',
  '9:00:00',
  '12:00:00',
  '47',
  '2832',
  '47.12',
  '47:12.5',
  ' 47:12',
  '47:12 ',
  '47 :12',
  '47: 12',
  '-47:12',
  '+47:12',
  '1:02:03:04',
  ':47',
  '47:',
  '1::00',
  'DNFF',
  'D N F',
  ' DNF',
  'RET',
  'OCS',
  '４7:12',
  '1e1:00',
  '0x1:00',
  'NaN',
])
  assert.throws(
    () => parseElapsed(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
for (const value of [2832, null, undefined, ['47:12'], {}, true])
  assert.throws(
    () => parseElapsed(value),
    TypeError,
    `${String(value)} is refused with a TypeError`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/tasks.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const listing = [
  'T7  2026-07-18  212 km triangle  (12 pilots)',
  '  SH  Sam Hart     Discus 2b  dnf',
  '  RO  Ruth Okafor  ASK 21     2:56:05',
  '  LA  Ann Lee      LS8        2:30:00',
  '  IR  Ivy Rose     Discus     2:20:00',
  '  DS  Dev Shah     ls8        2:21:40',
  '  LC  Lee Cho      Astir CS   DSQ',
  '  KN  Kim Ng       Astir CS   2:30:25',
  '  TF  Tom Fox      DG-300     2:7:15',
  '  MT  Mo Tan       Pegase     2:45:10',
  '  PM  Pat Moss     K-13       DNS',
  '  BK  Bea Kerr     Std Cirrus 61:10',
  '  JB  Jo Bell      K-13       3:40:00',
  'T8  2026-07-25  Ridge out and return  (2 pilots)',
  '  LA  Ann Lee      LS8        DNS',
  '  RO  Ruth Okafor  ASK 21     Dns',
  'T9  2026-08-01  Evening ridge race  (3 pilots)',
  '  DS  Dev Shah     LS8        7:59:59',
  '  MT  Mo Tan       Pegase     0:58',
  '  LA  Ann Lee      K-13       47:30',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [id, lines, problems] of [
  [
    'T7',
    [
      '1  Kim Ng (Astir CS)  2:21:24  1',
      '2  Dev Shah (LS8)  2:33:00  2',
      '=3  Ann Lee (LS8)  2:42:00  3.5',
      '=3  Ruth Okafor (ASK 21)  2:42:00  3.5',
      '5  Mo Tan (Pegase)  2:46:49  5',
      '6  Jo Bell (K-13)  2:56:00  6',
      'DNF  Sam Hart (Discus 2b)  9',
      'DSQ  Lee Cho (Astir CS)  9',
      'DNS  Pat Moss (K-13)  10',
      'Launched: 8 of 9',
    ],
    [
      ['Ivy Rose', 'Discus'],
      ['Tom Fox', '2:7:15'],
      ['Bea Kerr', '61:10'],
    ],
  ],
  [' t8 ', ['DNS  Ann Lee (LS8)  3', 'DNS  Ruth Okafor (ASK 21)  3', 'Launched: 0 of 2'], []],
  [
    't9',
    [
      '1  Mo Tan (Pegase)  0:59  1',
      '2  Ann Lee (K-13)  38:00  2',
      '3  Dev Shah (LS8)  8:38:23  3',
      'Launched: 3 of 3',
    ],
    [],
  ],
]) {
  const result = run('--results', id)
  assert.equal(result.status, 0, `--results ${id} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--results ${id}`)
  const errors = stderrLines(result)
  for (const line of errors) assert.match(line, /^glide: /, 'stderr lines start with "glide: "')
  for (const [who, what] of problems)
    assert.ok(
      errors.some((line) => line.includes(who) && line.includes(what)),
      `${who}'s ${what} is named on stderr`,
    )
  if (problems.length === 0) assert.equal(errors.length, 0, `nothing on stderr for ${id}`)
}
for (const args of [
  ['--results'],
  ['--results', ''],
  ['--results', 'T10'],
  ['--results', 'T7x'],
  ['--results', 'T'],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^glide: /, 'stderr lines start with "glide: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
