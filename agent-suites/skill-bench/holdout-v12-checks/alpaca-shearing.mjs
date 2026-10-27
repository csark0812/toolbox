// Hidden acceptance for moving the fleece side of src/shearing.mjs into src/fleece.mjs: the new
// module defines the moved names and shearing.mjs no longer does, the report (which looks its
// functions up by name from config/report-columns.json), the co-op export and the season-close
// script go through the new module, every command prints what it did for the bundled visits and
// for a second file full of band edges, and the co-op's app still gets the same grades from
// `alpaca-shearing/shearing`.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
const MOVED = ['GRADES', 'PRICE_PER_KG', 'gradeFleece', 'fleeceValue', 'bagLabel']
// Error messages count; stack frames (file paths, line numbers) do not.
const messages = (stderr) =>
  stderr
    .split('\n')
    .filter((line) => /^(\w*Error\b|No visit)/.test(line))
    .join('\n')

const alt = '.visits-alt.json'
const animal = (tag, species, micron, fleeceKg) =>
  micron === undefined ? { tag, species, fleeceKg } : { tag, species, micron, fleeceKg }
const altVisits = [
  {
    ref: 'X-1',
    farm: 'hafod',
    date: '2026-04-28',
    miles: 10,
    animals: [
      animal('X-01', 'alpaca', 23, 2.2),
      animal('X-02', 'alpaca', 26, 2.05),
      animal('X-03', 'llama', 30, 3.6),
      animal('X-04', 'alpaca', 18.0001, 2.35),
      animal('X-05', 'alpaca', 15.2, 1.85),
      animal('X-06', 'alpaca', null, 2.45),
    ],
  },
  {
    ref: 'X-2',
    farm: 'pentre',
    date: '2025-05-20',
    miles: 11,
    animals: [animal('X-07', 'llama', 29.99, 4.25), animal('X-08', 'alpaca', 20.5, 2.6)],
  },
  {
    ref: 'X-3',
    farm: 'bryn',
    date: '2026-06-30',
    miles: 0,
    animals: [animal('X-09', 'alpaca', 19.2, 2.15), animal('X-10', 'llama', 22.95, 3.05)],
  },
]
const lost = '.visits-lost.json'
const lostVisits = [
  {
    ref: 'L-1',
    farm: 'bryn',
    date: '2026-07-01',
    miles: 12,
    animals: [animal('L-01', 'alpaca', 21, 2.3), animal('L-02', 'alpaca', undefined, 2.1)],
  },
]
writeFileSync(join(dir, alt), JSON.stringify(altVisits))
writeFileSync(join(dir, lost), JSON.stringify(lostVisits))

const cases = []
for (const file of [[], [alt], [lost]])
  cases.push(
    ['bin/bags.mjs', ...file],
    ['bin/report.mjs', ...file],
    ['bin/coop-export.mjs', ...file],
  )
for (const ref of ['V-201', 'V-202', 'V-203', 'V-204', 'V-999'])
  cases.push(['bin/invoice.mjs', ref])
for (const ref of ['X-1', 'X-2', 'X-3']) cases.push(['bin/invoice.mjs', ref, alt])
cases.push(['bin/invoice.mjs', 'L-1', lost])

const actual = {}
const record = (key, r) => {
  actual[key] = hash(`${r.status}\0${r.stdout}\0${messages(r.stderr)}`)
  if (!process.env.RECORD && expected()[key] !== actual[key])
    assert.fail(
      `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nexit ${r.status}`,
    )
}
try {
  for (const [script, ...args] of cases)
    record(
      [script, ...args].join(' '),
      spawnSync(process.execPath, [script, ...args], {
        cwd: dir,
        encoding: 'utf8',
        timeout: 15000,
      }),
    )
  for (const [year, ...file] of [['2026'], ['2025'], ['2024'], ['2026', alt], ['2025', alt]])
    record(
      ['season-close', year, ...file].join(' '),
      spawnSync('sh', ['scripts/season-close.sh', year, ...file], {
        cwd: dir,
        encoding: 'utf8',
        timeout: 15000,
      }),
    )

  // The co-op's intake app, by package name.
  const coop = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const { gradeFleece, GRADES } = await import('alpaca-shearing/shearing')
       const out = [0, 12, 17.99, 18, 18.01, 20, 20.5, 23, 25.99, 26, 30, 30.01, 44, null, undefined].map((m) => {
         try { return gradeFleece(m) } catch (e) { return 'throws ' + e.message }
       })
       console.log(JSON.stringify({ out, GRADES }))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  )
  actual.coop = hash(coop)
  if (!process.env.RECORD)
    assert.equal(actual.coop, expected().coop, `alpaca-shearing/shearing answers changed:\n${coop}`)
} finally {
  rmSync(join(dir, alt), { force: true })
  rmSync(join(dir, lost), { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

// The fleece code lives in src/fleece.mjs, and our own callers go there for it.
const exported = JSON.parse(
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `console.log(JSON.stringify(Object.keys(await import('./src/fleece.mjs'))))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  ),
)
for (const name of MOVED) assert.ok(exported.includes(name), `src/fleece.mjs exports ${name}`)
assert.doesNotMatch(
  readFileSync(join(dir, 'src/shearing.mjs'), 'utf8'),
  /\bfunction\s+(gradeFleece|fleeceValue|bagLabel)\b|\b(GRADES|PRICE_PER_KG)\s*=/,
  'src/shearing.mjs no longer defines the fleece code',
)
for (const file of ['bin/report.mjs', 'bin/coop-export.mjs', 'scripts/season-close.sh'])
  assert.match(readFileSync(join(dir, file), 'utf8'), /fleece\.mjs/, `${file} uses src/fleece.mjs`)
const tests = readdirSync(join(dir, 'tests')).map((name) =>
  readFileSync(join(dir, 'tests', name), 'utf8'),
)
assert.ok(
  tests.some((text) => /fleece\.mjs/.test(text)),
  'the tests cover src/fleece.mjs',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    'bin/bags.mjs': '4cead00d8e48fa08',
    'bin/report.mjs': '9ac193fdf7cac858',
    'bin/coop-export.mjs': '4ad5c2c7cd927dae',
    'bin/bags.mjs .visits-alt.json': '84edcacc78db8769',
    'bin/report.mjs .visits-alt.json': '41ecac9933e964e0',
    'bin/coop-export.mjs .visits-alt.json': 'f07479e8a5419bc3',
    'bin/bags.mjs .visits-lost.json': '9b50169d5d7ba151',
    'bin/report.mjs .visits-lost.json': 'c2d3b75a56ec91ab',
    'bin/coop-export.mjs .visits-lost.json': 'cdeb5ec678d8643c',
    'bin/invoice.mjs V-201': 'e34fb5f6e661ccca',
    'bin/invoice.mjs V-202': '31c726462d2ee26f',
    'bin/invoice.mjs V-203': '9926005d78b91841',
    'bin/invoice.mjs V-204': '388e526413850327',
    'bin/invoice.mjs V-999': 'bd48eccb4952491c',
    'bin/invoice.mjs X-1 .visits-alt.json': '333ebfd85affdfcc',
    'bin/invoice.mjs X-2 .visits-alt.json': '5752a1d0b13e8bfd',
    'bin/invoice.mjs X-3 .visits-alt.json': '9ba48908f9017fec',
    'bin/invoice.mjs L-1 .visits-lost.json': '336cb810d3915477',
    'season-close 2026': '4d209fe2d0a587b5',
    'season-close 2025': '120294d6c6efdd45',
    'season-close 2024': 'a7e12516d6c81819',
    'season-close 2026 .visits-alt.json': '7beb37a7eac63dbf',
    'season-close 2025 .visits-alt.json': '8cf021cd9ef8c30b',
    coop: 'fc2fdf8b5398718f',
  }
}
