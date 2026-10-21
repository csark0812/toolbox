// Hidden acceptance for pulling the pumpkin pricing into one place: src/pricing.mjs holds the only
// rate table and the till, the receipts and the online quotes use it, while every command (till,
// receipts, online quotes, the barn price board run from a shell script) prints byte-for-byte what
// it did, including the weights where the copies disagreed, and the web shop's
// `pumpkin-patch/orders` import still quotes baskets exactly as before.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)

const alt = '.sales-alt.json'
const altOrders = '.orders-alt.json'
writeFileSync(
  join(dir, alt),
  JSON.stringify([
    { id: 'S-0201', time: '09:15', items: [{ variety: 'giant', kg: 13 }, { kg: 0.05 }] },
    { id: 'S-0202', time: '09:50', items: [{ variety: 'turban', kg: 2.25 }] },
    {
      id: 'S-0203',
      time: '12:00',
      items: [
        { variety: 'munchkin', kg: 0.2 },
        { variety: 'giant', kg: 21 },
      ],
    },
    {
      id: 'S-0204',
      time: '13:45',
      items: [
        { variety: 'crown', kg: 1.05 },
        { variety: 'carving', kg: 12.35 },
      ],
    },
  ]),
)
writeFileSync(
  join(dir, altOrders),
  JSON.stringify([
    {
      ref: 'W-901',
      name: 'Amos',
      items: [
        { variety: 'giant', kg: 21 },
        { variety: 'carving', kg: 0.9 },
      ],
    },
    { ref: 'W-902', name: 'Begum', items: [{ variety: 'munchkin', kg: 0.83 }] },
    {
      ref: 'W-903',
      name: 'Cole',
      items: [
        { variety: 'crown', kg: 1.15 },
        { variety: 'giant', kg: 13 },
      ],
    },
    { ref: 'W-904', name: 'Dunn', items: [{ kg: 3 }] },
    { ref: 'W-905', name: 'Evans', items: [{ variety: 'carving', kg: 16.65 }] },
  ]),
)
writeFileSync(join(dir, '.empty.json'), '[]')
const cases = [
  ['bin/till.mjs', 'giant', '13'],
  ['bin/till.mjs', 'giant', '21', 'carving', '4.2'],
  ['bin/till.mjs', 'munchkin', '0.3', 'munchkin', '0.83', 'crown', '1.05'],
  ['bin/till.mjs', 'carving', '0.05', 'carving', '12.35', 'carving', '16.65'],
  ['bin/till.mjs', 'giant', '18.4', 'crown', '3.15'],
  ['bin/till.mjs', 'turban', '2'],
  ['bin/till.mjs', 'carving', '4', 'pumpkin', '3'],
  ['bin/till.mjs', 'carving'],
  ['bin/till.mjs'],
  ['bin/till.mjs', 'carving', 'heavy'],
  ['bin/till.mjs', 'carving', '-1'],
  ['bin/receipts.mjs'],
  ['bin/receipts.mjs', '--file', alt],
  ['bin/receipts.mjs', '--file', '.empty.json'],
  ['bin/receipts.mjs', '--file', 'missing.json'],
  ['bin/online.mjs'],
  ['bin/online.mjs', '--file', altOrders],
  ['bin/online.mjs', '--file', '.empty.json'],
  ['bin/online.mjs', '--file', 'missing.json'],
]
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
  const board = spawnSync('sh', ['scripts/board.sh'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 15000,
  })
  actual.board = hash(`${board.status}\0${board.stdout}\0${board.stderr}`)
  if (!process.env.RECORD)
    assert.equal(
      actual.board,
      expected().board,
      `the price board changed:\n${board.stdout}${board.stderr}`,
    )

  // The web shop's import, by package name.
  const baskets = [
    [{ variety: 'giant', kg: 13 }],
    [
      { variety: 'giant', kg: 21 },
      { variety: 'munchkin', kg: 0.1 },
    ],
    [
      { variety: 'carving', kg: 1.6 },
      { variety: 'carving', kg: 1.7 },
    ],
    [
      { variety: 'crown', kg: 0.95 },
      { variety: 'munchkin', kg: 0.84 },
      { variety: 'carving', kg: 9.99 },
    ],
    [],
  ]
  const shop = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const { quoteOrder } = await import('pumpkin-patch/orders')
       const out = ${JSON.stringify(baskets)}.map((items) => quoteOrder(items))
       for (const bad of [[{ variety: 'turban', kg: 1 }], [{ kg: 2 }]])
         try { out.push(quoteOrder(bad)) } catch (error) { out.push(error.message) }
       console.log(JSON.stringify(out))`,
    ],
    { cwd: dir, encoding: 'utf8', stdio: 'pipe' },
  )
  actual.shop = hash(shop)
  if (!process.env.RECORD)
    assert.equal(actual.shop, expected().shop, `pumpkin-patch/orders quotes changed:\n${shop}`)
} finally {
  for (const file of [alt, altOrders, '.empty.json']) rmSync(join(dir, file), { force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
// One rate table, in src/pricing.mjs, and the three callers use it.
assert.ok(existsSync(join(dir, 'src/pricing.mjs')), 'src/pricing.mjs exists')
const sources = []
const walk = (path) => {
  for (const name of readdirSync(path)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(path, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(mjs|js|sh|json)$/.test(name)) sources.push(relative(dir, full))
  }
}
for (const sub of ['bin', 'src', 'scripts']) if (existsSync(join(dir, sub))) walk(join(dir, sub))
const tables = sources.filter((file) =>
  /giant['"]?\s*:\s*(85|0\.85)\b/.test(readFileSync(join(dir, file), 'utf8')),
)
assert.deepEqual(tables, ['src/pricing.mjs'], 'only src/pricing.mjs holds a rate table')
for (const file of ['bin/till.mjs', 'bin/receipts.mjs', 'src/online-orders.mjs'])
  assert.match(
    readFileSync(join(dir, file), 'utf8'),
    /pricing\.mjs/,
    `${file} uses src/pricing.mjs`,
  )

execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    'bin/till.mjs giant 13': '05fcead2d4840297',
    'bin/till.mjs giant 21 carving 4.2': 'ddcacbc7dc868f4c',
    'bin/till.mjs munchkin 0.3 munchkin 0.83 crown 1.05': 'f55aa37ed7981f01',
    'bin/till.mjs carving 0.05 carving 12.35 carving 16.65': '0d5aecaab437a006',
    'bin/till.mjs giant 18.4 crown 3.15': '0b1fb9aeca6a205c',
    'bin/till.mjs turban 2': '9424979141df3ba5',
    'bin/till.mjs carving 4 pumpkin 3': '066be3c4220d3d84',
    'bin/till.mjs carving': '22de10169af4116a',
    'bin/till.mjs': '22de10169af4116a',
    'bin/till.mjs carving heavy': '3e541168439eee46',
    'bin/till.mjs carving -1': 'e672036ddbf1a382',
    'bin/receipts.mjs': '990e3be2fbfc7929',
    'bin/receipts.mjs --file .sales-alt.json': 'f7dba9662612f3f0',
    'bin/receipts.mjs --file .empty.json': 'b0efbbc43054beee',
    'bin/receipts.mjs --file missing.json': 'b7994cc4161a8ee9',
    'bin/online.mjs': '0a97df137853446c',
    'bin/online.mjs --file .orders-alt.json': '78e197f1094a840a',
    'bin/online.mjs --file .empty.json': 'b0efbbc43054beee',
    'bin/online.mjs --file missing.json': 'b7994cc4161a8ee9',
    board: 'f6ffb326ea649d8c',
    shop: 'a497d13c771170c8',
  }
}
