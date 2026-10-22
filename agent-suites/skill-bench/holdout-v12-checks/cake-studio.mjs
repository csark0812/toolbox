// Hidden acceptance for merging the three portion calculations into portionsFor in
// src/portions.mjs: the quote, the kitchen sheet (whose template looks its functions up by name)
// and the delivery note all use the new module, the old servingsFor and tierServings names are
// gone, and every command, the price-list script and the courier's --json included, prints what it
// did for the bundled orders and for a second order book full of the cases where the copies differ.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
// Error messages count; stack frames and echoed source lines do not.
const messages = (stderr) =>
  stderr
    .split('\n')
    .filter((line) => /^(\w*Error\b|\w+: )/.test(line))
    .join('\n')

const alt = '.orders-alt.json'
const altOrders = [
  {
    ref: 'C-901',
    customer: 'Buffet order',
    date: '2026-12-01',
    flavour: 'sponge',
    style: 'buffet',
    tiers: [{ shape: 'round', size: 10 }],
    miles: 2,
  },
  {
    ref: 'C-902',
    customer: 'Hexagon trial',
    date: '2026-12-02',
    flavour: 'fruit',
    style: 'wedding',
    tiers: [
      { shape: 'hexagon', size: 10 },
      { shape: 'heart', size: 10 },
    ],
    miles: 5,
  },
  {
    ref: 'C-903',
    customer: 'Party rounds',
    date: '2026-12-03',
    flavour: 'chocolate',
    style: 'party',
    tiers: [
      { shape: 'round', size: 9 },
      { shape: 'round', size: 16 },
      { shape: 'heart', size: 12 },
      { shape: 'square', size: 7 },
    ],
    miles: 0,
  },
  {
    ref: 'C-904',
    customer: 'No style given',
    date: '2026-12-04',
    flavour: 'fruit',
    tiers: [
      { shape: 'round', size: 16 },
      { shape: 'square', size: 6 },
    ],
    miles: 9,
  },
  {
    ref: 'C-905',
    customer: 'Big wedding',
    date: '2026-12-05',
    flavour: 'sponge',
    style: 'wedding',
    tiers: [
      { shape: 'round', size: 14 },
      { shape: 'round', size: 13 },
      { shape: 'round', size: 7 },
    ],
    miles: 40,
  },
]
writeFileSync(join(dir, alt), JSON.stringify(altOrders))

const cases = []
for (const ref of ['C-301', 'C-302', 'C-303', 'C-304', 'C-999'])
  cases.push(
    ['bin/quote.mjs', ref],
    ['bin/sheet.mjs', ref],
    ['bin/delivery-note.mjs', ref],
    ['bin/delivery-note.mjs', ref, '--json'],
  )
for (const ref of ['C-901', 'C-902', 'C-903', 'C-904', 'C-905'])
  cases.push(
    ['bin/quote.mjs', ref, alt],
    ['bin/sheet.mjs', ref, alt],
    ['bin/delivery-note.mjs', ref, alt],
    ['bin/delivery-note.mjs', ref, alt, '--json'],
  )
for (const enquiry of [
  ['--style', 'party', 'round:10', 'heart:8'],
  ['--style', 'wedding', '--flavour', 'fruit', 'round:9', 'round:16', 'square:11'],
  ['--style', 'wedding', 'hexagon:10', '--miles', '12'],
  ['--style', 'buffet', 'round:10'],
  ['round:10'],
  ['--style', 'party', '--flavour', 'lemon', 'round:8'],
])
  cases.push(['bin/quote.mjs', ...enquiry])

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
  for (const style of [[], ['wedding'], ['party'], ['buffet']])
    record(
      ['price-list', ...style].join(' '),
      spawnSync('sh', ['scripts/price-list.sh', ...style], {
        cwd: dir,
        encoding: 'utf8',
        timeout: 15000,
      }),
    )
} finally {
  rmSync(join(dir, alt), { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

// One portionsFor in src/portions.mjs, used by all three, under the new name only.
const exported = JSON.parse(
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `console.log(JSON.stringify(Object.keys(await import('./src/portions.mjs'))))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  ),
)
assert.ok(exported.includes('portionsFor'), 'src/portions.mjs exports portionsFor')
for (const file of ['bin/quote.mjs', 'src/order-sheet.mjs', 'bin/delivery-note.mjs'])
  assert.match(
    readFileSync(join(dir, file), 'utf8'),
    /portions\.mjs/,
    `${file} uses src/portions.mjs`,
  )
const walk = (path) =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((name) => walk(join(path, name)))
    : [path]
for (const folder of ['bin', 'src', 'scripts', 'templates', 'tests'])
  if (existsSync(join(dir, folder)))
    for (const file of walk(join(dir, folder)))
      assert.doesNotMatch(
        readFileSync(file, 'utf8'),
        /\b(servingsFor|tierServings)\b/,
        `${file} still uses an old name`,
      )
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    'bin/quote.mjs C-301': '398449d1b609fefe',
    'bin/sheet.mjs C-301': 'df1ff9d7b71acf1a',
    'bin/delivery-note.mjs C-301': 'b6a364c4053c6480',
    'bin/delivery-note.mjs C-301 --json': '538365c88f469107',
    'bin/quote.mjs C-302': 'df732a7caf010e00',
    'bin/sheet.mjs C-302': '7cc7d398f76503b5',
    'bin/delivery-note.mjs C-302': '871f8394c541f250',
    'bin/delivery-note.mjs C-302 --json': '142db66a80618b77',
    'bin/quote.mjs C-303': '87ee75906b2ea22b',
    'bin/sheet.mjs C-303': 'b0b951b904e6d4a6',
    'bin/delivery-note.mjs C-303': 'af3f99182a903ed6',
    'bin/delivery-note.mjs C-303 --json': 'a2a7a7aae48cca97',
    'bin/quote.mjs C-304': 'aeae3a1e5d6fe4ae',
    'bin/sheet.mjs C-304': 'c99bf42370e25c27',
    'bin/delivery-note.mjs C-304': '8e16dae62fb00a9d',
    'bin/delivery-note.mjs C-304 --json': 'f66a24e62d3362dc',
    'bin/quote.mjs C-999': '07aa2645b8c9392d',
    'bin/sheet.mjs C-999': '5a8bcb37ddb6697c',
    'bin/delivery-note.mjs C-999': 'b67a6cf27dccda8a',
    'bin/delivery-note.mjs C-999 --json': 'b67a6cf27dccda8a',
    'bin/quote.mjs C-901 .orders-alt.json': '7a67d8489673f0ba',
    'bin/sheet.mjs C-901 .orders-alt.json': '8fe632b40ebee081',
    'bin/delivery-note.mjs C-901 .orders-alt.json': 'c00181f0e263df28',
    'bin/delivery-note.mjs C-901 .orders-alt.json --json': '49d8787ef2dbdb32',
    'bin/quote.mjs C-902 .orders-alt.json': '18bde12c2c303f30',
    'bin/sheet.mjs C-902 .orders-alt.json': 'cd23f0a1a20f164f',
    'bin/delivery-note.mjs C-902 .orders-alt.json': 'c5595a6d1d2f7411',
    'bin/delivery-note.mjs C-902 .orders-alt.json --json': '914da7ba47d5335f',
    'bin/quote.mjs C-903 .orders-alt.json': '7bd7696139f557f2',
    'bin/sheet.mjs C-903 .orders-alt.json': '3d7ab20cec34db1e',
    'bin/delivery-note.mjs C-903 .orders-alt.json': 'c2b87ef2de83af9d',
    'bin/delivery-note.mjs C-903 .orders-alt.json --json': 'd5c31938667e3da1',
    'bin/quote.mjs C-904 .orders-alt.json': '87ee75906b2ea22b',
    'bin/sheet.mjs C-904 .orders-alt.json': '1ddf0b229123e332',
    'bin/delivery-note.mjs C-904 .orders-alt.json': 'a4015fe4b4560885',
    'bin/delivery-note.mjs C-904 .orders-alt.json --json': '7c359d422bcc68a2',
    'bin/quote.mjs C-905 .orders-alt.json': '5dfe982887f4d874',
    'bin/sheet.mjs C-905 .orders-alt.json': 'df49d9be50a36af6',
    'bin/delivery-note.mjs C-905 .orders-alt.json': 'dc52a99dc51b4187',
    'bin/delivery-note.mjs C-905 .orders-alt.json --json': 'f605fbeacf5283a7',
    'bin/quote.mjs --style party round:10 heart:8': '66247a42cff21d62',
    'bin/quote.mjs --style wedding --flavour fruit round:9 round:16 square:11': '01d4b35e9a1e9622',
    'bin/quote.mjs --style wedding hexagon:10 --miles 12': '3e3afca419e7bc90',
    'bin/quote.mjs --style buffet round:10': '7a67d8489673f0ba',
    'bin/quote.mjs round:10': '87ee75906b2ea22b',
    'bin/quote.mjs --style party --flavour lemon round:8': 'acab94da1afc58be',
    'price-list': 'b0805e20c26c845e',
    'price-list wedding': 'b0805e20c26c845e',
    'price-list party': 'ee5126709987be66',
    'price-list buffet': 'ce857a2d068f0dba',
  }
}
