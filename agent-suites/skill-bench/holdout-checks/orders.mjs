// Hidden acceptance for the orders refactor: one status field, no boolean flags, same public behavior.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
const { createOrder, pay, ship, cancel } = await load('order.mjs')
const { shipReady } = await load('fulfilment.mjs')
const { label } = await load('dashboard.mjs')
for (const file of readdirSync(join(dir, 'src')))
  assert.doesNotMatch(
    readFileSync(join(dir, 'src', file), 'utf8'),
    /isPaid|isShipped|isCancelled/,
    `${file} still uses boolean flags`,
  )
const order = createOrder(7)
assert.equal(typeof order.status, 'string', 'orders carry one status field')
assert.equal(label(order), 'New')
assert.equal(label(pay(order)), 'Paid')
assert.equal(label(ship(pay(order))), 'Shipped')
assert.equal(label(cancel(pay(order))), 'Cancelled')
assert.throws(() => ship(order))
assert.throws(() => pay(pay(order)))
assert.throws(() => cancel(ship(pay(order))))
assert.throws(() => pay(cancel(order)))
assert.deepEqual(shipReady([order, pay(order), cancel(order)]).map(label), [
  'New',
  'Shipped',
  'Cancelled',
])
