// Hidden acceptance for moving the permit side of src/hire.mjs into src/permits.mjs: the new module
// defines the moved names and hire.mjs no longer does, the quote, permit and cron callers go
// through the new module, and every command (quotes priced by a name-built lookup, neighbour
// letters, permit applications, the cron reminder script) prints byte-for-byte what it did,
// while the councils' portal still gets needsPermit and permitFee from `skip-hire/hire`.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
const MOVED = [
  'PERMIT_FEES',
  'needsPermit',
  'permitFee',
  'permitEnd',
  'expiringPermits',
  'permitApplication',
]

const alt = '.bookings-alt.json'
const altBookings = [
  {
    ref: 'X-1',
    customer: 'B. Cole',
    address: '1 Hill St',
    postcode: 'BS1 5TR',
    size: 'maxi',
    weeks: 3,
    placement: 'road',
    start: '2026-10-20',
  },
  {
    ref: 'X-2',
    customer: 'D. Eze',
    address: '7 Brook Way',
    postcode: 'BS16 1AA',
    size: 'mini',
    weeks: 5,
    placement: 'road',
    start: '2026-10-01',
  },
  {
    ref: 'X-3',
    customer: 'F. Gale',
    address: '2 Ash Close',
    postcode: 'BS48 9ZZ',
    size: 'midi',
    weeks: 1,
    placement: 'verge',
    start: '2026-10-22',
  },
  {
    ref: 'X-4',
    customer: 'H. Imre',
    address: 'Rose Cottage',
    postcode: 'bs21 7pp',
    size: 'builders',
    weeks: 2,
    placement: 'pavement',
    start: '2026-10-23',
  },
  {
    ref: 'X-5',
    customer: 'J. Kerr',
    address: '40 Long Row',
    postcode: 'BS36 1XY',
    size: 'midi',
    weeks: 1,
    start: '2026-10-24',
  },
  {
    ref: 'X-6',
    customer: 'L. Moss',
    address: '8 Kiln Yard',
    postcode: 'BS6 6AB',
    size: 'mini',
    weeks: 2,
    placement: 'private',
    start: '2026-10-24',
  },
  {
    ref: 'X-7',
    customer: 'N. Oduya',
    address: '11 Ferry Lane',
    postcode: 'BS21 6HU',
    size: 'maxi',
    weeks: 6,
    placement: 'road',
    start: '2026-10-04',
  },
]
writeFileSync(join(dir, alt), JSON.stringify(altBookings))
writeFileSync(
  join(dir, '.bookings-none.json'),
  JSON.stringify(altBookings.filter((b) => b.placement === 'private')),
)
const cases = []
for (const ref of ['SK-310', 'SK-311', 'SK-312', 'SK-313', 'SK-314', 'SK-315', 'SK-999'])
  cases.push(['bin/quote.mjs', ref])
for (const [size, postcode, placement, weeks] of [
  ['mini', 'BS1 1AA', 'road', '1'],
  ['maxi', 'BS16 4ZZ', 'road', '3'],
  ['builders', 'BS48 2CC', 'road', '2'],
  ['midi', 'BS21 6HU', 'verge', '1'],
  ['midi', 'BS3 4RT', 'private', '2'],
  ['jumbo', 'BS3 4RT', 'road', '1'],
  ['mini', 'GL1 1AA', 'road', '1'],
  ['mini', 'BS36 2AB', 'pavement', '1'],
])
  cases.push([
    'bin/quote.mjs',
    '--size',
    size,
    '--postcode',
    postcode,
    '--placement',
    placement,
    '--weeks',
    weeks,
  ])
cases.push(['bin/quote.mjs', '--postcode', 'BS6 7QT'])
for (const file of [[], [alt], ['.bookings-none.json']])
  cases.push(['bin/letters.mjs', ...file], ['bin/permits.mjs', ...file])
const actual = {}
try {
  for (const [script, ...args] of cases) {
    const r = spawnSync(process.execPath, [script, ...args], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 15000,
    })
    const key = [script, ...args].join(' ')
    actual[key] = hash(`${r.status}\0${r.stdout}\0${r.stderr}`)
    if (!process.env.RECORD && expected()[key] !== actual[key])
      assert.fail(
        `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nexit ${r.status}`,
      )
  }
  for (const today of [
    '2026-10-12',
    '2026-10-24',
    '2026-10-25',
    '2026-10-26',
    '2026-10-28',
    '2026-11-03',
  ])
    for (const file of [[], [alt]]) {
      const r = spawnSync('sh', ['ops/permit-reminders.sh', today, ...file], {
        cwd: dir,
        encoding: 'utf8',
        timeout: 15000,
      })
      const key = ['reminders', today, ...file].join(' ')
      actual[key] = hash(`${r.status}\0${r.stdout}\0${r.stderr}`)
      if (!process.env.RECORD && expected()[key] !== actual[key])
        assert.fail(
          `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nexit ${r.status}`,
        )
    }

  // The councils' portal, by package name.
  const portal = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const { needsPermit, permitFee } = await import('skip-hire/hire')
       const { loadBookings } = await import('./src/bookings.mjs')
       const all = [...loadBookings(), ...loadBookings('${alt}'), { placement: 'driveway', postcode: 'ZZ9 9ZZ' }]
       console.log(JSON.stringify(all.map((b) => [b.ref, needsPermit(b), permitFee(b)])))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  )
  actual.portal = hash(portal)
  if (!process.env.RECORD)
    assert.equal(actual.portal, expected().portal, `skip-hire/hire answers changed:\n${portal}`)
} finally {
  rmSync(join(dir, alt), { force: true })
  rmSync(join(dir, '.bookings-none.json'), { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

// The permit code lives in src/permits.mjs, and the callers go there for it.
const exported = JSON.parse(
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `console.log(JSON.stringify(Object.keys(await import('./src/permits.mjs'))))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  ),
)
for (const name of MOVED) assert.ok(exported.includes(name), `src/permits.mjs exports ${name}`)
const hire = readFileSync(join(dir, 'src/hire.mjs'), 'utf8')
assert.doesNotMatch(
  hire,
  /\bfunction\s+(needsPermit|permitFee|permitEnd|expiringPermits|permitApplication)\b|\bPERMIT_FEES\s*=/,
  'src/hire.mjs no longer defines the permit code',
)
for (const file of ['bin/quote.mjs', 'bin/permits.mjs', 'ops/permit-reminders.sh'])
  assert.match(
    readFileSync(join(dir, file), 'utf8'),
    /permits\.mjs/,
    `${file} uses src/permits.mjs`,
  )
const tests = readdirSync(join(dir, 'tests')).map((name) =>
  readFileSync(join(dir, 'tests', name), 'utf8'),
)
assert.ok(
  tests.some((text) => /permits\.mjs/.test(text)),
  'the tests cover src/permits.mjs',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    'bin/quote.mjs SK-310': 'a35c0a85d57ca833',
    'bin/quote.mjs SK-311': '4b05b7ee19ca861e',
    'bin/quote.mjs SK-312': '51a7f3aae5f8d9a8',
    'bin/quote.mjs SK-313': 'a89bf27606fe528e',
    'bin/quote.mjs SK-314': 'd9c15a266c96304c',
    'bin/quote.mjs SK-315': '923ace880825d406',
    'bin/quote.mjs SK-999': '4b2670dec9586fc4',
    'bin/quote.mjs --size mini --postcode BS1 1AA --placement road --weeks 1': '3d07528442b66ffc',
    'bin/quote.mjs --size maxi --postcode BS16 4ZZ --placement road --weeks 3': '560e679306653121',
    'bin/quote.mjs --size builders --postcode BS48 2CC --placement road --weeks 2':
      '1da4e15a20f38054',
    'bin/quote.mjs --size midi --postcode BS21 6HU --placement verge --weeks 1': '261acb0ce5e375ef',
    'bin/quote.mjs --size midi --postcode BS3 4RT --placement private --weeks 2':
      '76c3f1e68f3e7784',
    'bin/quote.mjs --size jumbo --postcode BS3 4RT --placement road --weeks 1': 'b83868e9b377b815',
    'bin/quote.mjs --size mini --postcode GL1 1AA --placement road --weeks 1': 'd40595053227b542',
    'bin/quote.mjs --size mini --postcode BS36 2AB --placement pavement --weeks 1':
      'f7656eb7f941df28',
    'bin/quote.mjs --postcode BS6 7QT': 'a231f824ffd6cec7',
    'bin/letters.mjs': '602baf0d55637588',
    'bin/permits.mjs': '407be86f5c3a6b18',
    'bin/letters.mjs .bookings-alt.json': 'f1879f0b01698072',
    'bin/permits.mjs .bookings-alt.json': 'b4e322d33a354ab5',
    'bin/letters.mjs .bookings-none.json': 'b477f81a6f39c61a',
    'bin/permits.mjs .bookings-none.json': '0b09e8b661c05b76',
    'reminders 2026-10-12': '7c9a318c23e0da23',
    'reminders 2026-10-12 .bookings-alt.json': '7c9a318c23e0da23',
    'reminders 2026-10-24': '6389adbc72129b88',
    'reminders 2026-10-24 .bookings-alt.json': '7dd1023430bdd843',
    'reminders 2026-10-25': '6389adbc72129b88',
    'reminders 2026-10-25 .bookings-alt.json': '7dd1023430bdd843',
    'reminders 2026-10-26': '60b3201a7fb4c006',
    'reminders 2026-10-26 .bookings-alt.json': '7c9a318c23e0da23',
    'reminders 2026-10-28': '672881ce897784df',
    'reminders 2026-10-28 .bookings-alt.json': 'a173b00bf14408c3',
    'reminders 2026-11-03': '7c9a318c23e0da23',
    'reminders 2026-11-03 .bookings-alt.json': '040a5e9b387efa67',
    portal: 'daf2f84226758d6c',
  }
}
