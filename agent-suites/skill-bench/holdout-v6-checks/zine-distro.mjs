// Hidden acceptance for the qty -> quantity rename: order lines in code and data use `quantity`,
// the shops' `qty` column (import and export) and `--sort qty` still work, and every command
// prints exactly what it printed before.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, file)).href)
const { importSheet, exportCsv } = await load('src/csv.mjs')
const { lineTotal, invoice } = await load('src/orders.mjs')
const { picklist } = await load('src/picklist.mjs')

const ordersFile = join(dir, 'data/orders.json')
const original = readFileSync(ordersFile, 'utf8')
const data = JSON.parse(original)
const counts = data.flatMap((order) =>
  order.lines.map((line) => [order.id, line.sku, line.quantity]),
)
assert.deepEqual(
  counts,
  [
    ['O-311', 'Z-001', 5],
    ['O-311', 'Z-012', 3],
    ['O-311', 'Z-020', 2],
    ['O-312', 'Z-007', 4],
    ['O-312', 'Z-001', 2],
    ['O-313', 'Z-031', 6],
    ['O-313', 'Z-012', 1],
    ['O-313', 'Z-007', 1],
  ],
  'data/orders.json lines carry `quantity`',
)
assert.ok(!original.includes('"qty"'), 'no `qty` left in data/orders.json')

assert.deepEqual(importSheet('order,sku,qty\nA,Z-012,4\n'), [
  { order: 'A', sku: 'Z-012', quantity: 4 },
])
assert.throws(() => importSheet('order,sku,qty\nA,Z-012,0\n'), RangeError)
assert.equal(lineTotal({ quantity: 3, unitPence: 250 }), 750)
const orders = [
  {
    id: 'A',
    shop: 'x',
    lines: [
      { sku: 'Z-001', quantity: 2 },
      { sku: 'Z-007', quantity: 4 },
    ],
  },
  { id: 'B', shop: 'y', lines: [{ sku: 'Z-001', quantity: 3 }] },
]
assert.equal(invoice(orders[0]).total, 2100)
const pulled = picklist(orders, 'qty')
assert.deepEqual(
  pulled.map((line) => [line.sku, line.quantity]),
  [
    ['Z-001', 5],
    ['Z-007', 4],
  ],
)
assert.ok(
  pulled.every((line) => !('qty' in line)),
  'pick list lines use `quantity`',
)
assert.equal(exportCsv(orders[1]), 'sku,title,qty,unitPence\nZ-001,Bike Repair Basics #3,3,250\n')

const OUTPUTS = {
  'picklist.mjs': [0, 'da48a03ea2e07ded'],
  'picklist.mjs --sort qty': [0, 'b2249aef05796fbf'],
  'picklist.mjs --sort title': [0, '377189f9772b4dce'],
  'picklist.mjs --sort price': [2, '315cc9d808db876e'],
  'invoice.mjs O-311': [0, '3159b8bf5cad31bd'],
  'invoice.mjs O-313': [0, '8ecc93f73b3fe119'],
  'export.mjs O-311': [0, 'a03bb87d5fc87ad2'],
  'export.mjs O-313': [0, '98b42c3e037657ca'],
  'import.mjs data/inbox/corner-press.csv': [0, 'fe8b7aa0934725dd'],
}
const run = (command) => {
  const [script, ...args] = command.split(' ')
  return spawnSync(process.execPath, [`bin/${script}`, ...args], { cwd: dir, encoding: 'utf8' })
}
try {
  for (const [command, [status, hash]] of Object.entries(OUTPUTS)) {
    const result = run(command)
    assert.equal(result.status, status, `${command} exit status`)
    assert.equal(
      createHash('sha256').update(`${result.stdout}|${result.stderr}`).digest('hex').slice(0, 16),
      hash,
      `${command} prints exactly what it printed before:\n${result.stdout}${result.stderr}`,
    )
  }
  const saved = run('import.mjs data/inbox/corner-press.csv --save')
  assert.equal(saved.status, 0)
  const after = JSON.parse(readFileSync(ordersFile, 'utf8'))
  const o312 = after.find((order) => order.id === 'O-312').lines
  assert.deepEqual(
    o312.map((line) => [line.sku, line.quantity]),
    [
      ['Z-007', 4],
      ['Z-001', 3],
      ['Z-020', 3],
      ['Z-031', 2],
    ],
    'imported lines are saved with `quantity`',
  )
  assert.ok(!readFileSync(ordersFile, 'utf8').includes('"qty"'), 'a save writes no `qty`')
} finally {
  writeFileSync(ordersFile, original)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
