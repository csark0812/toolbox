// Hidden acceptance for the ferry bookings: bookings in flight at the same time never lose an
// update or oversell a sailing, a failed booking does not hold up the others, and the travel
// agents' batch is booked first come, first served.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { book } = await import(pathToFileURL(join(dir, 'src/booking.mjs')).href)
const { SailingStore } = await import(pathToFileURL(join(dir, 'src/store.mjs')).href)

const out = execFileSync(process.execPath, ['bin/import.mjs', 'data/requests.json'], {
  cwd: dir,
  encoding: 'utf8',
})
const lines = out.trim().split('\n')
const status = (ref) => lines.find((line) => line.startsWith(`${ref} `)) ?? ''
for (const ref of ['TA-001', 'TA-005', 'TA-008', 'TA-011', 'TA-013', 'TA-014', 'TA-019'])
  assert.match(status(ref), /booked/, `${ref} is booked`)
for (const ref of ['TA-009', 'TA-010', 'TA-020'])
  assert.match(status(ref), /refused/, `${ref} is refused`)
assert.match(status('TA-001'), /£44\.00/, 'fares are unchanged')
assert.match(out, /17 booked, 3 refused/)
assert.match(out, /07:40 Port Ellis\s+cars 8\/8\s+seats 26\/40/)
assert.match(out, /09:10 Port Ellis\s+cars 3\/10\s+seats 35\/40/)

const withTimeout = (promise, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error(`${label} never finished`)), 5000)
      timer.unref()
    }),
  ])
const sailing = (id, carSpaces, seats) => ({
  id,
  label: id,
  carSpaces,
  seats,
  cars: 0,
  passengers: 0,
})

// Thirty cars at once for five spaces.
let store = new SailingStore([sailing('S1', 5, 100)])
let results = await withTimeout(
  Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      book(store, { ref: `C${i}`, sailing: 'S1', vehicle: 'car', passengers: 1 }),
    ),
  ),
  'thirty concurrent car bookings',
)
assert.equal(results.filter((r) => r.ok).length, 5, 'exactly five cars are booked')
let row = await store.get('S1')
assert.deepEqual([row.cars, row.passengers], [5, 5], 'the store matches the confirmations')

// Foot passengers racing for seats, on two sailings, with a broken request in the middle.
store = new SailingStore([sailing('S1', 2, 20), sailing('S2', 2, 9)])
const requests = []
for (let i = 0; i < 15; i++) {
  requests.push({ ref: `F${i}`, sailing: 'S1', vehicle: 'foot', passengers: 2 })
  requests.push({ ref: `G${i}`, sailing: 'S2', vehicle: i % 2 ? 'car' : 'foot', passengers: 3 })
  if (i === 4) requests.push({ ref: 'X', sailing: 'S9', vehicle: 'foot', passengers: 1 })
}
const settled = await withTimeout(
  Promise.allSettled(requests.map((request) => book(store, request))),
  'a batch with a failing request',
)
const failed = settled.filter((s) => s.status === 'rejected')
assert.equal(failed.length, 1, 'only the unknown sailing fails')
assert.ok(failed[0].reason instanceof RangeError)
results = settled.filter((s) => s.status === 'fulfilled').map((s) => s.value)
const okFor = (prefix) => results.filter((r) => r.ok && r.ref.startsWith(prefix))
assert.equal(okFor('F').length, 10, 'twenty seats hold ten pairs')
row = await store.get('S1')
assert.deepEqual([row.cars, row.passengers], [0, 20])
const s2 = await store.get('S2')
const g = okFor('G').map((r) => requests.find((q) => q.ref === r.ref))
assert.equal(s2.passengers, g.length * 3, 'S2 seats match its confirmations')
assert.equal(s2.cars, g.filter((q) => q.vehicle === 'car').length, 'S2 cars match')
assert.ok(s2.passengers <= 9 && s2.cars <= 2, 'S2 is not oversold')
assert.equal(g.length, 3, 'S2 fills its nine seats')

// Afterwards the store still takes bookings one at a time as before.
const late = await withTimeout(
  book(store, { ref: 'L', sailing: 'S1', vehicle: 'foot', passengers: 1 }),
  'a later booking',
)
assert.equal(late.ok, false, 'a full sailing refuses')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
