// Hidden acceptance for the batch -> lot rename: src/lots.mjs exports findLot, lotSummary and
// lotLabel with no batch-named alias anywhere, wheels and summary rows carry lotId (the dairy's
// data file is untouched), and every command prints byte-for-byte what it printed before:
// the --batch flag, the label printer's JSON (key names, key order, extra fields), the wheel
// card's field order and labels, across many dates and a second dairy export with its fields in
// another order.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]

const alt = '.dairy-alt.json'
writeFileSync(
  join(dir, alt),
  JSON.stringify([
    {
      batchId: 'B-30',
      wheelId: 'W-201',
      cheese: 'Blue',
      made: '2026-07-01',
      turns: 9,
      weightKg: 2,
      rack: '3B',
    },
    {
      wheelId: 'W-202',
      cheese: 'Tomme',
      batchId: 'B-31',
      made: '2026-05-05',
      weightKg: 4.5,
      turns: 20,
    },
    {
      wheelId: 'W-203',
      batchId: 'B-30',
      note: 'sample for show',
      cheese: 'Blue',
      made: '2026-07-01',
      turns: 9,
      weightKg: 1.95,
    },
  ]),
)
const cases = []
const dates = ['2026-06-01', '2026-09-01', '2026-10-16', '2026-10-17', '2026-10-21', '2027-03-01']
for (const date of dates) {
  cases.push(['status', '--date', date])
  for (const b of ['B-17', 'B-18', 'B-21', 'B-22', 'B-24', 'B-99'])
    cases.push(['status', '--batch', b, '--date', date])
  cases.push(['labels', '--date', date], ['labels', '--json', '--date', date])
  for (let n = 101; n <= 110; n++) cases.push(['card', `W-${n}`, '--date', date])
}
cases.push(['card', 'W-999', '--date', '2026-10-21'])
for (const date of ['2026-08-01', '2026-10-21']) {
  cases.push(
    ['status', '--file', alt, '--date', date],
    ['status', '--file', alt, '--batch', 'B-30', '--date', date],
  )
  cases.push(
    ['labels', '--file', alt, '--date', date],
    ['labels', '--file', alt, '--json', '--date', date],
  )
  for (const w of ['W-201', 'W-202', 'W-203'])
    cases.push(['card', w, '--file', alt, '--date', date])
}
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
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

assert.ok(!existsSync(join(dir, 'src/batches.mjs')), 'src/batches.mjs is gone')
const lots = await import(pathToFileURL(join(dir, 'src/lots.mjs')).href)
for (const name of ['findLot', 'lotSummary', 'lotLabel'])
  assert.equal(typeof lots[name], 'function', `src/lots.mjs exports ${name}`)
const sources = []
for (const sub of ['src', 'bin', 'tests'])
  for (const file of readdirSync(join(dir, sub), { recursive: true }))
    if (/\.m?js$/.test(file))
      sources.push([`${sub}/${file}`, readFileSync(join(dir, sub, file), 'utf8')])
for (const [file, text] of sources) {
  assert.doesNotMatch(
    text,
    /\b(findBatch|batchSummary|batchLabel)\b/,
    `${file} still uses an old name`,
  )
  assert.doesNotMatch(text, /\.batchId\b/, `${file} still reads .batchId`)
  if (file.startsWith('src/')) {
    const mod = await import(pathToFileURL(join(dir, file)).href)
    for (const key of Object.keys(mod))
      assert.doesNotMatch(key, /batch/i, `${file} exports a batch-named alias ${key}`)
  }
}
const { loadWheels } = await import(pathToFileURL(join(dir, 'src/wheels.mjs')).href)
const wheels = loadWheels(join(dir, 'data/wheels.json'))
assert.equal(wheels.length, 10)
assert.ok(
  wheels.every((w) => w.lotId && !('batchId' in w)),
  'loaded wheels carry lotId only',
)
assert.deepEqual(
  lots.findLot(wheels, 'B-18').map((w) => w.wheelId),
  ['W-104', 'W-105', 'W-109'],
)
const rows = lots.lotSummary(wheels, '2026-10-21')
assert.equal(rows.length, 5)
assert.ok(
  rows.every((row) => row.lotId && !('batchId' in row)),
  'summary rows carry lotId only',
)
assert.equal(lots.lotLabel('B-21'), 'Batch B-21')

execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    'status --date 2026-06-01': '5c856392a5916d08',
    'status --batch B-17 --date 2026-06-01': 'fd6d6d9d5c97c551',
    'status --batch B-18 --date 2026-06-01': 'fffd775358e533ff',
    'status --batch B-21 --date 2026-06-01': '1e2c62f8acb13593',
    'status --batch B-22 --date 2026-06-01': '8ce35c386d0c33b6',
    'status --batch B-24 --date 2026-06-01': '0f1906e3ab688a5f',
    'status --batch B-99 --date 2026-06-01': '4071c4bed912290d',
    'labels --date 2026-06-01': 'c779bef227304129',
    'labels --json --date 2026-06-01': '3bfc34b734db6dd3',
    'card W-101 --date 2026-06-01': 'a735327de2c7f98c',
    'card W-102 --date 2026-06-01': 'bac5b3b1f2959f92',
    'card W-103 --date 2026-06-01': '73c119c3e276d7b4',
    'card W-104 --date 2026-06-01': 'b2e476a437bbe2b0',
    'card W-105 --date 2026-06-01': 'c2d40053eadcd9e9',
    'card W-106 --date 2026-06-01': 'c8d8b8be98d556eb',
    'card W-107 --date 2026-06-01': 'e7692b9bf8a2ad88',
    'card W-108 --date 2026-06-01': '0b59fb72bfe0cde6',
    'card W-109 --date 2026-06-01': '98958d16a9a3dd04',
    'card W-110 --date 2026-06-01': 'a8e0024d1b5722da',
    'status --date 2026-09-01': '9ac411e129eb4206',
    'status --batch B-17 --date 2026-09-01': 'd9b54027e9aa3dd5',
    'status --batch B-18 --date 2026-09-01': 'c85922d840d8a198',
    'status --batch B-21 --date 2026-09-01': '7cff11e696479f15',
    'status --batch B-22 --date 2026-09-01': 'a5cd0f0b1543814b',
    'status --batch B-24 --date 2026-09-01': 'cc53e6d85d34f8e8',
    'status --batch B-99 --date 2026-09-01': '4071c4bed912290d',
    'labels --date 2026-09-01': '85dc144d3cbdf067',
    'labels --json --date 2026-09-01': 'e1d38222868a08be',
    'card W-101 --date 2026-09-01': '41c98797005b808c',
    'card W-102 --date 2026-09-01': 'bcf2509c24b8075c',
    'card W-103 --date 2026-09-01': 'bb99b752294cd694',
    'card W-104 --date 2026-09-01': '2be04a8996c39914',
    'card W-105 --date 2026-09-01': '855d5310c14d3744',
    'card W-106 --date 2026-09-01': 'fc2577283f663ada',
    'card W-107 --date 2026-09-01': 'e97b92d59ad4c40e',
    'card W-108 --date 2026-09-01': 'c40f48c722d7eee6',
    'card W-109 --date 2026-09-01': 'e4987ae4ae01f370',
    'card W-110 --date 2026-09-01': '51b49f9a0a6429a8',
    'status --date 2026-10-16': 'b5d7fd29b2be91bf',
    'status --batch B-17 --date 2026-10-16': 'cc742411720a5b43',
    'status --batch B-18 --date 2026-10-16': '1b9147d6e756482f',
    'status --batch B-21 --date 2026-10-16': 'ee93a19b4af5e153',
    'status --batch B-22 --date 2026-10-16': 'ffc7c3e39d211c1f',
    'status --batch B-24 --date 2026-10-16': '71e21f0e29360499',
    'status --batch B-99 --date 2026-10-16': '4071c4bed912290d',
    'labels --date 2026-10-16': '49f9112a4a6c4d0e',
    'labels --json --date 2026-10-16': '094a10e417f1f912',
    'card W-101 --date 2026-10-16': '186ccd66e9eec0fd',
    'card W-102 --date 2026-10-16': 'd23460f36ced56d2',
    'card W-103 --date 2026-10-16': '0175155db62e6be1',
    'card W-104 --date 2026-10-16': '31f2a5920eb31927',
    'card W-105 --date 2026-10-16': 'b01587061151c0b2',
    'card W-106 --date 2026-10-16': 'c70dd560b6910ab2',
    'card W-107 --date 2026-10-16': '07349fb7d6296653',
    'card W-108 --date 2026-10-16': '93aa9ecae2f55503',
    'card W-109 --date 2026-10-16': '9b3f5c21d18bb7fc',
    'card W-110 --date 2026-10-16': '71243e4b5050487e',
    'status --date 2026-10-17': '3ee0544971c8d598',
    'status --batch B-17 --date 2026-10-17': 'd1a74617f8afc61f',
    'status --batch B-18 --date 2026-10-17': '610196075cb1ee18',
    'status --batch B-21 --date 2026-10-17': '34e3f194e136be72',
    'status --batch B-22 --date 2026-10-17': '88dc4da33dc00bc3',
    'status --batch B-24 --date 2026-10-17': 'df90de438c1ee4b9',
    'status --batch B-99 --date 2026-10-17': '4071c4bed912290d',
    'labels --date 2026-10-17': 'df05deee0aab8147',
    'labels --json --date 2026-10-17': 'fdd17f66886c82a9',
    'card W-101 --date 2026-10-17': '22c4ffeb8ab90c13',
    'card W-102 --date 2026-10-17': '482f2498ee900bb2',
    'card W-103 --date 2026-10-17': '13f7a5e67a12f288',
    'card W-104 --date 2026-10-17': '810abc2b317c945c',
    'card W-105 --date 2026-10-17': '1e01b39ac670af1c',
    'card W-106 --date 2026-10-17': 'eb143408dad3be76',
    'card W-107 --date 2026-10-17': 'd0dc5ec1c968a08b',
    'card W-108 --date 2026-10-17': 'e20c66507deaf2c5',
    'card W-109 --date 2026-10-17': '02862cb8b723a866',
    'card W-110 --date 2026-10-17': '38798f7d729361f7',
    'status --date 2026-10-21': '3ee0544971c8d598',
    'status --batch B-17 --date 2026-10-21': 'f2bff22cb42044e6',
    'status --batch B-18 --date 2026-10-21': 'e951b25dc8cfb8dc',
    'status --batch B-21 --date 2026-10-21': 'aba18d6eccdb6a43',
    'status --batch B-22 --date 2026-10-21': 'a198850f26ea0304',
    'status --batch B-24 --date 2026-10-21': '4509559d135523de',
    'status --batch B-99 --date 2026-10-21': '4071c4bed912290d',
    'labels --date 2026-10-21': 'df05deee0aab8147',
    'labels --json --date 2026-10-21': 'fdd17f66886c82a9',
    'card W-101 --date 2026-10-21': 'd56a61edec59ecf9',
    'card W-102 --date 2026-10-21': '2b202222c15cce23',
    'card W-103 --date 2026-10-21': '57c4cb0cf229c035',
    'card W-104 --date 2026-10-21': '5f7ec64699a3e96a',
    'card W-105 --date 2026-10-21': '35abe6527faff2e9',
    'card W-106 --date 2026-10-21': '4b388e6fbffead0f',
    'card W-107 --date 2026-10-21': 'aa61a9323c745b88',
    'card W-108 --date 2026-10-21': 'a7baef1bb472726f',
    'card W-109 --date 2026-10-21': '6d2a55ad2042538d',
    'card W-110 --date 2026-10-21': '031ce811946c2e0e',
    'status --date 2027-03-01': '14f2312696f29926',
    'status --batch B-17 --date 2027-03-01': '12bc798907fa67c2',
    'status --batch B-18 --date 2027-03-01': '8664cff7c67ee3f9',
    'status --batch B-21 --date 2027-03-01': '5babca712e8f782f',
    'status --batch B-22 --date 2027-03-01': 'fb1c73f64ba59109',
    'status --batch B-24 --date 2027-03-01': 'b58fdafe69767fba',
    'status --batch B-99 --date 2027-03-01': '4071c4bed912290d',
    'labels --date 2027-03-01': '59075082bb931459',
    'labels --json --date 2027-03-01': '91b6aa3499afe108',
    'card W-101 --date 2027-03-01': 'c991783a8849c180',
    'card W-102 --date 2027-03-01': '7c2a0e8249fd0540',
    'card W-103 --date 2027-03-01': 'c51fbb265484d8b5',
    'card W-104 --date 2027-03-01': 'd2244164e759093f',
    'card W-105 --date 2027-03-01': '576ac3ff8ce88d81',
    'card W-106 --date 2027-03-01': '41c2d4a1fa86e53b',
    'card W-107 --date 2027-03-01': '633d4b122a3ae3ae',
    'card W-108 --date 2027-03-01': 'f7ddf66ee7eb00f0',
    'card W-109 --date 2027-03-01': '110a4d36ca82a373',
    'card W-110 --date 2027-03-01': 'a5c909ddce520c71',
    'card W-999 --date 2026-10-21': '487987b81716ec05',
    'status --file .dairy-alt.json --date 2026-08-01': 'b762be930cc414af',
    'status --file .dairy-alt.json --batch B-30 --date 2026-08-01': '87348119cedfbe0a',
    'labels --file .dairy-alt.json --date 2026-08-01': '70fa4a4d76c22a0a',
    'labels --file .dairy-alt.json --json --date 2026-08-01': '3bfc34b734db6dd3',
    'card W-201 --file .dairy-alt.json --date 2026-08-01': 'b18abd25b5736799',
    'card W-202 --file .dairy-alt.json --date 2026-08-01': '15a1d17423bdea8e',
    'card W-203 --file .dairy-alt.json --date 2026-08-01': '1e939bf499f265be',
    'status --file .dairy-alt.json --date 2026-10-21': 'e8f1b7978eaf6b4e',
    'status --file .dairy-alt.json --batch B-30 --date 2026-10-21': '7569f89510286980',
    'labels --file .dairy-alt.json --date 2026-10-21': '79cd18544495331a',
    'labels --file .dairy-alt.json --json --date 2026-10-21': 'e97efcaa6e8b103f',
    'card W-201 --file .dairy-alt.json --date 2026-10-21': 'f3e44de58c28dc26',
    'card W-202 --file .dairy-alt.json --date 2026-10-21': '0d8cd61d645e04ce',
    'card W-203 --file .dairy-alt.json --date 2026-10-21': '05a6b04ad4a7b593',
  }
}
