// Hidden acceptance for checkouts and --high-finishes: parseCheckout scores one to three darts,
// singles/doubles/trebles 1-20, 25 and BULL, in any case, finishing on a double, and refuses the
// rest with a RangeError quoting the text; the legs command lists 100+ finishes with their value,
// names an unreadable visit on stderr, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseCheckout } = await import(pathToFileURL(join(dir, 'src/checkout.mjs')).href)
for (const [text, points] of [
  ['T20 T20 D20', 160],
  ['D16', 32],
  ['t19 s18 d16', 107],
  ['T20 T20 BULL', 170],
  ['bull', 50],
  ['Bull', 50],
  ['20 D20', 60],
  ['25 D20', 65],
  ['S1 D1', 3],
  ['T1 T1 D1', 8],
  ['BULL BULL', 100],
  ['25 T20 D5', 95],
])
  assert.equal(parseCheckout(text), points, text)
for (const text of [
  '',
  'T20 T20 S20',
  'T20',
  '25',
  '20',
  'D25',
  'T25',
  'S0',
  'D0',
  'D21',
  'T20 T20 T20 D20',
  'D',
  'X20',
  '50',
  'DBULL',
  'T20,D20',
  'D-1',
  'D2.5',
])
  assert.throws(
    () => parseCheckout(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/legs.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const all = [
  '2026-09-03  Kath Doyle  beat Sid Pym     T20 T20 D20',
  '2026-09-03  Sid Pym     beat Kath Doyle  D16',
  '2026-09-10  Raj Bhatt   beat Lou Hart    T19 S18 D16',
  '2026-09-10  Lou Hart    beat Raj Bhatt   T20 T20 BULL',
  '2026-09-17  Kath Doyle  beat Raj Bhatt   T20 T19 D12',
  '2026-09-17  Sid Pym     beat Lou Hart    20 D20',
  '2026-09-24  Lou Hart    beat Kath Doyle  T20 T20 S20',
  '2026-09-24  Raj Bhatt   beat Sid Pym     25 T20 D5',
  '2026-10-01  Kath Doyle  beat Lou Hart    T17 T18 D20',
]
const plain = run()
assert.equal(plain.stdout, all.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const high = run('--high-finishes')
assert.equal(high.status, 0, '--high-finishes exits 0')
assert.equal(
  high.stdout,
  [`${all[0]}  160`, `${all[2]}  107`, `${all[3]}  170`, `${all[4]}  141`, `${all[8]}  145`].join(
    '\n',
  ) + '\n',
  '--high-finishes lists checkouts of 100 or more with their value',
)
assert.match(high.stderr, /T20 T20 S20/i, 'the unreadable visit is named on stderr')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
