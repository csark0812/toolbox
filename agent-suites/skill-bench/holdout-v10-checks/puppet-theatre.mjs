// Hidden acceptance for pulling pricing out of the box office: src/pricing.mjs owns the moved
// names and src/box-office.mjs no longer exports them, either module loads first on its own
// (no import cycle that crashes one entry point), the season set through pricing is the one
// bookings are priced with, and quote, book and report (whose sections are named by module in
// data/reports.json) print byte-for-byte what they did, for many seats, types, seasons and files.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const MOVED = [
  'BASE_PENCE',
  'SEASONS',
  'setSeason',
  'currentSeason',
  'roundPence',
  'adultPrice',
  'childPrice',
  'concessionPrice',
  'TICKET_TYPES',
  'priceFor',
  'pounds',
  'priceList',
]

const alt = '.bookings-alt.json'
const empty = '.bookings-empty.json'
writeFileSync(
  join(dir, alt),
  JSON.stringify([
    { show: 'Fri 19:00', seat: 'A6', type: 'adult', pence: 1740 },
    { show: 'Fri 19:00', seat: 'B1', type: 'concession', pence: 1440 },
    { show: 'Fri 19:00', seat: 'F1', type: 'child', pence: 685 },
    { show: 'Mon 10:00', seat: 'C3', type: 'child', pence: 575 },
  ]),
)
writeFileSync(join(dir, empty), '[]')
const cases = []
for (const season of [null, 'standard', 'panto', 'schools', 'xmas']) {
  const s = season ? ['--season', season] : []
  for (const seat of ['A1', 'B6', 'C4', 'D1', 'E3', 'F6'])
    for (const type of [null, 'adult', 'child', 'concession'])
      cases.push(['quote', seat, ...(type ? ['--type', type] : []), ...s])
  cases.push(['report', ...s], ['report', '--file', alt, ...s])
  cases.push(['book', '--show', 'Sat 14:00', '--seat', 'C6', '--type', 'concession', ...s])
  cases.push(['book', '--show', 'Sun 11:00', '--seat', 'E2', '--type', 'child', ...s])
}
for (const odd of [
  ['G4'],
  ['A0'],
  ['A7'],
  ['C'],
  ['C4', '--type', 'senior'],
  ['C4', '--type', 'Adult'],
  ['C4', '--type', 'pounds'],
])
  cases.push(['quote', ...odd])
cases.push(['report', '--file', empty], ['report', '--file', 'missing.json'])
cases.push(
  ['book', '--show', 'Sat 14:00', '--seat', 'C4'],
  ['book', '--show', 'Sat 11:00', '--seat', 'A2', '--type', 'child'],
)
cases.push(
  ['book', '--show', 'Sat 11:00', '--seat', 'Z9'],
  ['book', '--show', 'Fri 19:00', '--seat', 'A6', '--file', alt],
)
cases.push(['book', '--show', 'Fri 19:00', '--seat', 'A5', '--file', alt, '--season', 'panto'])
cases.push(['book', '--show', 'Sat 11:00', '--seat', 'B3', '--type', 'senior'])
const actual = {}
try {
  for (const [script, ...args] of cases) {
    const r = spawnSync(process.execPath, [`bin/${script}.mjs`, ...args], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 15000,
    })
    const key = [script, ...args].join(' ')
    actual[key] = createHash('sha256')
      .update(`${r.status}\0${r.stdout}\0${r.stderr}`)
      .digest('hex')
      .slice(0, 16)
    if (!process.env.RECORD && expected()[key] !== actual[key])
      assert.fail(
        `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nexit ${r.status}`,
      )
  }
} finally {
  rmSync(join(dir, alt), { force: true })
  rmSync(join(dir, empty), { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

// Each module loads first, in a fresh process, and the season is shared.
const probe = (code) =>
  execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    cwd: dir,
    encoding: 'utf8',
    stdio: 'pipe',
  })
const pricingFirst = probe(`
  const pricing = await import('./src/pricing.mjs')
  const office = await import('./src/box-office.mjs')
  const moved = ${JSON.stringify(MOVED)}
  const missing = moved.filter((name) => !(name in pricing))
  const left = moved.filter((name) => name in office)
  pricing.setSeason('panto')
  const booked = office.book([], 'Fri 19:00', 'A1', 'child')
  console.log(JSON.stringify({ missing, left, booked, list: pricing.priceList([]), report: office.takingsReport([{ show: 'X', seat: 'A1', type: 'adult', pence: 4320 }]) }))
`)
const first = JSON.parse(pricingFirst)
assert.deepEqual(first.missing, [], 'src/pricing.mjs exports every moved name')
assert.deepEqual(
  first.left,
  [],
  'src/box-office.mjs no longer exports (or re-exports) the moved names',
)
assert.equal(first.booked.pence, 1045, 'bookings are priced with the season set through pricing')
assert.equal(first.list[0], 'Season: panto')
assert.deepEqual(first.report, ['X           1 sold   £43.20  10% of a full house'])
const officeFirst = JSON.parse(
  probe(`
  const office = await import('./src/box-office.mjs')
  const pricing = await import('./src/pricing.mjs')
  console.log(JSON.stringify({ seats: office.SEATS.length, adult: pricing.adultPrice('E1'), band: office.bandFor('E1') }))
`),
)
assert.deepEqual(officeFirst, { seats: 36, adult: 950, band: 'back' })
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    'quote A1': 'c66eff05852eddca',
    'quote A1 --type adult': 'c66eff05852eddca',
    'quote A1 --type child': 'ff076b4020dec692',
    'quote A1 --type concession': 'c8f87204838f97b7',
    'quote B6': 'a04c24cbd074e126',
    'quote B6 --type adult': 'a04c24cbd074e126',
    'quote B6 --type child': '39f7d4b1622772df',
    'quote B6 --type concession': 'c26c50c691451adf',
    'quote C4': 'e639284afdea5544',
    'quote C4 --type adult': 'e639284afdea5544',
    'quote C4 --type child': '41833bce910f854b',
    'quote C4 --type concession': '3ef9de35195af4fc',
    'quote D1': 'cf37314fe6f799de',
    'quote D1 --type adult': 'cf37314fe6f799de',
    'quote D1 --type child': 'db281bd9e29c1854',
    'quote D1 --type concession': '633af3f81421fcd2',
    'quote E3': 'e02648ef2bbdeded',
    'quote E3 --type adult': 'e02648ef2bbdeded',
    'quote E3 --type child': '052b523c038388b6',
    'quote E3 --type concession': '211ffc44bce47918',
    'quote F6': 'e86ebe58404c2c0c',
    'quote F6 --type adult': 'e86ebe58404c2c0c',
    'quote F6 --type child': '59ba73145c9501bd',
    'quote F6 --type concession': '6fdef4ddecbd4378',
    report: '484932158f0f9b27',
    'report --file .bookings-alt.json': '70c1f1dc3e79cbd6',
    'book --show Sat 14:00 --seat C6 --type concession': 'eb79aafbd21a3fc2',
    'book --show Sun 11:00 --seat E2 --type child': 'b20e6458cc6b180f',
    'quote A1 --season standard': 'c66eff05852eddca',
    'quote A1 --type adult --season standard': 'c66eff05852eddca',
    'quote A1 --type child --season standard': 'ff076b4020dec692',
    'quote A1 --type concession --season standard': 'c8f87204838f97b7',
    'quote B6 --season standard': 'a04c24cbd074e126',
    'quote B6 --type adult --season standard': 'a04c24cbd074e126',
    'quote B6 --type child --season standard': '39f7d4b1622772df',
    'quote B6 --type concession --season standard': 'c26c50c691451adf',
    'quote C4 --season standard': 'e639284afdea5544',
    'quote C4 --type adult --season standard': 'e639284afdea5544',
    'quote C4 --type child --season standard': '41833bce910f854b',
    'quote C4 --type concession --season standard': '3ef9de35195af4fc',
    'quote D1 --season standard': 'cf37314fe6f799de',
    'quote D1 --type adult --season standard': 'cf37314fe6f799de',
    'quote D1 --type child --season standard': 'db281bd9e29c1854',
    'quote D1 --type concession --season standard': '633af3f81421fcd2',
    'quote E3 --season standard': 'e02648ef2bbdeded',
    'quote E3 --type adult --season standard': 'e02648ef2bbdeded',
    'quote E3 --type child --season standard': '052b523c038388b6',
    'quote E3 --type concession --season standard': '211ffc44bce47918',
    'quote F6 --season standard': 'e86ebe58404c2c0c',
    'quote F6 --type adult --season standard': 'e86ebe58404c2c0c',
    'quote F6 --type child --season standard': '59ba73145c9501bd',
    'quote F6 --type concession --season standard': '6fdef4ddecbd4378',
    'report --season standard': '484932158f0f9b27',
    'report --file .bookings-alt.json --season standard': '70c1f1dc3e79cbd6',
    'book --show Sat 14:00 --seat C6 --type concession --season standard': 'eb79aafbd21a3fc2',
    'book --show Sun 11:00 --seat E2 --type child --season standard': 'b20e6458cc6b180f',
    'quote A1 --season panto': '6b38c21f7776c95d',
    'quote A1 --type adult --season panto': '6b38c21f7776c95d',
    'quote A1 --type child --season panto': '8d1b0962aa2936b5',
    'quote A1 --type concession --season panto': 'f99caf17515ac100',
    'quote B6 --season panto': '7bbc3e2fd8d4a2e3',
    'quote B6 --type adult --season panto': '7bbc3e2fd8d4a2e3',
    'quote B6 --type child --season panto': '1f6fa4cdcc1511e9',
    'quote B6 --type concession --season panto': 'b25a87b6980f1a94',
    'quote C4 --season panto': '55311ca8814d999a',
    'quote C4 --type adult --season panto': '55311ca8814d999a',
    'quote C4 --type child --season panto': 'd1fc0093c8c1302b',
    'quote C4 --type concession --season panto': 'c2b36a8db56a3b48',
    'quote D1 --season panto': '82f58d9d60032bb6',
    'quote D1 --type adult --season panto': '82f58d9d60032bb6',
    'quote D1 --type child --season panto': '7b90688aa325519f',
    'quote D1 --type concession --season panto': 'cc57f7a2eccdb4fb',
    'quote E3 --season panto': '63e8403222a91c23',
    'quote E3 --type adult --season panto': '63e8403222a91c23',
    'quote E3 --type child --season panto': '84db281aaccd5025',
    'quote E3 --type concession --season panto': 'e2f1a7f2bcbc849e',
    'quote F6 --season panto': '9cc609aaf6bc2208',
    'quote F6 --type adult --season panto': '9cc609aaf6bc2208',
    'quote F6 --type child --season panto': 'c3dd9f6920d4b930',
    'quote F6 --type concession --season panto': '1c264c7be1304f92',
    'report --season panto': '143cbe77d6c4f386',
    'report --file .bookings-alt.json --season panto': '1a5eecce3cecac34',
    'book --show Sat 14:00 --seat C6 --type concession --season panto': '4b30e78f652fac57',
    'book --show Sun 11:00 --seat E2 --type child --season panto': '5e47dfccd7050ea9',
    'quote A1 --season schools': '3a3f5be473cfcad4',
    'quote A1 --type adult --season schools': '3a3f5be473cfcad4',
    'quote A1 --type child --season schools': '39f31188cedb771a',
    'quote A1 --type concession --season schools': '3eadc530ec413f9b',
    'quote B6 --season schools': '7b7f241c7b9fdea1',
    'quote B6 --type adult --season schools': '7b7f241c7b9fdea1',
    'quote B6 --type child --season schools': '7471040718d2d124',
    'quote B6 --type concession --season schools': '64ab729e37a9a076',
    'quote C4 --season schools': '62375e46309a1ae8',
    'quote C4 --type adult --season schools': '62375e46309a1ae8',
    'quote C4 --type child --season schools': 'c698904171204d44',
    'quote C4 --type concession --season schools': 'd55da6214a861ebf',
    'quote D1 --season schools': '1366f91f4fb6b62a',
    'quote D1 --type adult --season schools': '1366f91f4fb6b62a',
    'quote D1 --type child --season schools': '0ba718a894b64546',
    'quote D1 --type concession --season schools': '7b7b03ce4ec968f9',
    'quote E3 --season schools': 'e316192a2071b058',
    'quote E3 --type adult --season schools': 'e316192a2071b058',
    'quote E3 --type child --season schools': 'b3ca6ca1f4a5ee90',
    'quote E3 --type concession --season schools': '0007fc7bb8b29c17',
    'quote F6 --season schools': 'e57bab351e994f84',
    'quote F6 --type adult --season schools': 'e57bab351e994f84',
    'quote F6 --type child --season schools': '5b0bd1f65505a833',
    'quote F6 --type concession --season schools': '3466eb0f4614a593',
    'report --season schools': '2142161298b02c3e',
    'report --file .bookings-alt.json --season schools': '33029f4d3b15e7e1',
    'book --show Sat 14:00 --seat C6 --type concession --season schools': '12d73f57a43ed1a2',
    'book --show Sun 11:00 --seat E2 --type child --season schools': 'bf0e822e90a0fa51',
    'quote A1 --season xmas': '529061f12ea4d180',
    'quote A1 --type adult --season xmas': '529061f12ea4d180',
    'quote A1 --type child --season xmas': '529061f12ea4d180',
    'quote A1 --type concession --season xmas': '529061f12ea4d180',
    'quote B6 --season xmas': '529061f12ea4d180',
    'quote B6 --type adult --season xmas': '529061f12ea4d180',
    'quote B6 --type child --season xmas': '529061f12ea4d180',
    'quote B6 --type concession --season xmas': '529061f12ea4d180',
    'quote C4 --season xmas': '529061f12ea4d180',
    'quote C4 --type adult --season xmas': '529061f12ea4d180',
    'quote C4 --type child --season xmas': '529061f12ea4d180',
    'quote C4 --type concession --season xmas': '529061f12ea4d180',
    'quote D1 --season xmas': '529061f12ea4d180',
    'quote D1 --type adult --season xmas': '529061f12ea4d180',
    'quote D1 --type child --season xmas': '529061f12ea4d180',
    'quote D1 --type concession --season xmas': '529061f12ea4d180',
    'quote E3 --season xmas': '529061f12ea4d180',
    'quote E3 --type adult --season xmas': '529061f12ea4d180',
    'quote E3 --type child --season xmas': '529061f12ea4d180',
    'quote E3 --type concession --season xmas': '529061f12ea4d180',
    'quote F6 --season xmas': '529061f12ea4d180',
    'quote F6 --type adult --season xmas': '529061f12ea4d180',
    'quote F6 --type child --season xmas': '529061f12ea4d180',
    'quote F6 --type concession --season xmas': '529061f12ea4d180',
    'report --season xmas': '6bcd57103252cccb',
    'report --file .bookings-alt.json --season xmas': '6bcd57103252cccb',
    'book --show Sat 14:00 --seat C6 --type concession --season xmas': '02e1caedc21cb7d4',
    'book --show Sun 11:00 --seat E2 --type child --season xmas': '02e1caedc21cb7d4',
    'quote G4': 'ba26479ed6bbf899',
    'quote A0': '554cc2b7faf4a351',
    'quote A7': '03e9114617be0f26',
    'quote C': '32ecff6eb63c6ac3',
    'quote C4 --type senior': '5a0d6d22d8c852c8',
    'quote C4 --type Adult': 'c19e02877928729c',
    'quote C4 --type pounds': 'd19590148ae9e195',
    'report --file .bookings-empty.json': '680ea13825ff9bf2',
    'report --file missing.json': '39e98f2ea22ee1c0',
    'book --show Sat 14:00 --seat C4': '593c4047fe10af9e',
    'book --show Sat 11:00 --seat A2 --type child': '0433521656624321',
    'book --show Sat 11:00 --seat Z9': '1de134e1b784b572',
    'book --show Fri 19:00 --seat A6 --file .bookings-alt.json': 'd1c832a38f2e5b7e',
    'book --show Fri 19:00 --seat A5 --file .bookings-alt.json --season panto': 'b093188630ef3af2',
    'book --show Sat 11:00 --seat B3 --type senior': 'bad3d52377316c86',
  }
}
