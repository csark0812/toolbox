// Hidden acceptance for dropsOn and --drops: a customer gets their pints on their days unless they
// are away (first and last day included); nothing goes out on a closed day, and a drop due then
// moves to the nearest earlier open day on top of what is due there, unless the customer is away on
// either day; dates are exact YYYY-MM-DD calendar dates in any timezone, refused with a RangeError
// quoting them, and non-strings with a TypeError. The customers command prints the drops and a
// total, a no-deliveries line, `milk: ` on every stderr line and exit 2 for a bad date, and is
// unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
process.env.TZ = 'America/Los_Angeles'
const drops = await import(pathToFileURL(join(dir, 'src/drops.mjs')).href)
// Only the name and pints of each drop are compared, so extra fields are fine.
const dropsOn = (...args) => drops.dropsOn(...args).map(({ name, pints }) => ({ name, pints }))
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const XMAS = ['2026-12-25', '2026-12-26', '2027-01-01']
const one = (customer, date, closed = XMAS) =>
  dropsOn(date, [{ name: 'A', address: '1 Lane', away: [], ...customer }], closed)
const pints = (customer, date, closed) => one(customer, date, closed)[0]?.pints ?? 0
for (const zone of ['America/Los_Angeles', 'Europe/London', 'Pacific/Kiritimati']) {
  process.env.TZ = zone
  const at = (text) => `${text} (TZ=${zone})`
  assert.equal(
    pints({ pints: 1, days: WEEK }, '2026-12-24'),
    3,
    at('Thursday 24 Dec takes Fri and Sat'),
  )
  assert.equal(
    pints({ pints: 2, days: WEEK }, '2026-12-24'),
    6,
    at('moved drops keep the order size'),
  )
  assert.deepEqual(one({ pints: 1, days: WEEK }, '2026-12-25'), [], at('nothing on a closed day'))
  assert.deepEqual(one({ pints: 1, days: WEEK }, '2026-12-26'), [], at('nothing on a closed day'))
  assert.equal(pints({ pints: 1, days: WEEK }, '2026-12-28'), 1, at('Monday after is normal'))
  assert.equal(pints({ pints: 1, days: WEEK }, '2026-12-31'), 2, at('New Year moves to the 31st'))
  assert.equal(pints({ pints: 1, days: ['Sat'] }, '2026-12-24'), 1, at('a Sat drop moves past Fri'))
  assert.equal(
    pints({ pints: 1, days: ['Sat'] }, '2026-12-23'),
    0,
    at('only to the nearest open day'),
  )
  assert.equal(pints({ pints: 1, days: ['Sun'] }, '2026-12-27'), 1, at('Sundays are open days'))
  assert.equal(pints({ pints: 1, days: ['Mon'] }, '2026-12-24'), 0, at('not their day'))
  assert.equal(
    pints({ pints: 1, days: WEEK, away: [{ from: '2026-12-25', to: '2026-12-25' }] }, '2026-12-24'),
    2,
    at('away on the closed day: that drop does not move'),
  )
  assert.equal(
    pints(
      { pints: 1, days: ['Fri'], away: [{ from: '2026-12-20', to: '2026-12-24' }] },
      '2026-12-24',
    ),
    0,
    at('away on the day it moves to: lost'),
  )
  assert.equal(
    pints(
      { pints: 1, days: ['Thu', 'Sat'], away: [{ from: '2026-12-24', to: '2026-12-24' }] },
      '2026-12-24',
    ),
    0,
    at('away on the day: nothing at all'),
  )
  assert.equal(
    pints(
      { pints: 1, days: ['Tue', 'Thu'], away: [{ from: '2026-12-01', to: '2026-12-03' }] },
      '2026-12-01',
    ),
    0,
    at('first away day included'),
  )
  assert.equal(
    pints(
      { pints: 1, days: ['Tue', 'Thu'], away: [{ from: '2026-12-01', to: '2026-12-03' }] },
      '2026-12-03',
    ),
    0,
    at('last away day included'),
  )
  assert.equal(
    pints(
      { pints: 1, days: ['Tue', 'Thu'], away: [{ from: '2026-12-01', to: '2026-12-03' }] },
      '2026-12-08',
    ),
    1,
    at('back after the away spell'),
  )
  assert.equal(
    pints({ pints: 1, days: ['Mon'], away: undefined }, '2026-12-07'),
    1,
    at('away may be missing'),
  )
  assert.equal(
    pints({ pints: 1, days: ['Mon'] }, '2026-03-29', ['2026-03-30']),
    1,
    at('across the spring clock change'),
  )
  assert.equal(
    pints({ pints: 1, days: ['Mon'] }, '2026-10-25', ['2026-10-26']),
    1,
    at('across the autumn clock change'),
  )
  assert.equal(
    pints({ pints: 1, days: ['Mon'] }, '2026-11-01', ['2026-11-02']),
    1,
    at('across the US clock change'),
  )
  assert.equal(pints({ pints: 1, days: ['Tue'] }, '2028-02-29', []), 1, at('29 Feb in a leap year'))
  assert.deepEqual(
    dropsOn(
      '2026-12-24',
      [
        { name: 'B', address: 'x', pints: 1, days: ['Mon'], away: [] },
        { name: 'C', address: 'y', pints: 2, days: ['Fri'], away: [] },
        { name: 'D', address: 'z', pints: 1, days: ['Thu'], away: [] },
      ],
      XMAS,
    ),
    [
      { name: 'C', pints: 2 },
      { name: 'D', pints: 1 },
    ],
    at('round order, nobody with nothing'),
  )
}
for (const date of [
  '',
  '2026-02-29',
  '2026-13-01',
  '2026-00-10',
  '2026-12-32',
  '2026-04-31',
  '2026-1-05',
  '20261224',
  '2026/12/24',
  '24/12/2026',
  '2026-12-24T00:00:00Z',
  ' 2026-12-24',
  '2026-12-24 ',
  'tomorrow',
])
  assert.throws(
    () => one({ pints: 1, days: WEEK }, date),
    (error) => error instanceof RangeError && error.message.includes(date),
    `${JSON.stringify(date)} is refused with a RangeError quoting it`,
  )
for (const value of [20261224, null, undefined, new Date('2026-12-24T12:00:00Z'), ['2026-12-24']])
  assert.throws(
    () => one({ pints: 1, days: WEEK }, value),
    TypeError,
    `${String(value)} is refused with a TypeError`,
  )

const plainLines = [
  'Mrs Okafor   4 Mill Lane        2 pints  Mon Wed Fri',
  'Mr Hale      9 Mill Lane        1 pint   Mon Tue Wed Thu Fri Sat',
  'The Patels   12 Church Street   3 pints  Tue Thu Sat',
  'Ivy Marsh    1 Church Street    1 pint   Fri',
  'Joe Brennan  30 Station Road    2 pints  Thu Sat',
  'Sunita Rao   2 Station Road     1 pint   Sat Sun',
]
for (const zone of ['Pacific/Auckland', 'America/Los_Angeles']) {
  const run = (...args) =>
    spawnSync(process.execPath, ['bin/customers.mjs', ...args], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, TZ: zone },
    })
  const plain = run()
  assert.equal(
    plain.stdout,
    plainLines.join('\n') + '\n',
    'without the option the list is unchanged',
  )
  assert.equal(plain.status, 0)
  for (const [date, lines] of [
    [
      '2026-12-24',
      [
        '2  Mrs Okafor, 4 Mill Lane',
        '3  Mr Hale, 9 Mill Lane',
        '3  The Patels, 12 Church Street',
        '1  Sunita Rao, 2 Station Road',
        'Total pints: 9',
      ],
    ],
    [
      '2026-12-31',
      [
        '2  Mrs Okafor, 4 Mill Lane',
        '2  Mr Hale, 9 Mill Lane',
        '1  Ivy Marsh, 1 Church Street',
        '2  Joe Brennan, 30 Station Road',
        'Total pints: 7',
      ],
    ],
    ['2026-12-23', ['2  Mrs Okafor, 4 Mill Lane', '1  Mr Hale, 9 Mill Lane', 'Total pints: 3']],
    ['2026-12-27', ['1  Sunita Rao, 2 Station Road', 'Total pints: 1']],
    ['2026-12-25', ['No deliveries on 2026-12-25.']],
  ]) {
    const result = run('--drops', date)
    assert.equal(result.status, 0, `--drops ${date} exits 0 (TZ=${zone})`)
    assert.equal(result.stdout, lines.join('\n') + '\n', `--drops ${date} (TZ=${zone})`)
  }
  for (const args of [
    ['--drops'],
    ['--drops', ''],
    ['--drops', '2026-02-30'],
    ['--drops', '20261224'],
    ['--drops', '24/12/2026'],
  ]) {
    const result = run(...args)
    assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
    assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
    const errors = result.stderr.split('\n').filter((line) => line.trim())
    assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
    for (const line of errors) assert.match(line, /^milk: /, 'stderr lines start with "milk: "')
  }
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
