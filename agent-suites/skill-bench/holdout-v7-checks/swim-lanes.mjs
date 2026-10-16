// Hidden acceptance for the lane cancellations: a cancelled slot is free straight away for the
// screen and for the next booking, on any day, and the day's run prints the right bookings and
// free slots.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/apply.mjs', 'data/changes.json'], {
    cwd: dir,
    encoding: 'utf8',
  }),
  [
    'booked    b1 Seals lane 1 06:00',
    'booked    b2 Seals lane 2 06:00',
    'booked    b3 Masters lane 3 06:00',
    'booked    b4 Triathlon lane 1 07:00',
    'booked    b5 Masters lane 4 08:00',
    'cancelled b2',
    'booked    b6 Otters lane 2 06:00',
    'refused   b7 Otters lane 3 06:00: taken',
    'cancelled b4',
    'booked    b8 Juniors lane 2 07:00',
    'unknown   b9: no booking',
    'booked    b10 Juniors lane 1 07:00',
    'cancelled b5',
    '',
    'Free on 2026-10-17',
    '  Lane 1  08:00',
    '  Lane 2  08:00',
    '  Lane 3  07:00 08:00',
    '  Lane 4  06:00 07:00 08:00',
    '',
  ].join('\n'),
  'the day of changes',
)

// Random bookings, cancellations and screen refreshes over two days against a plain model.
const { createPool } = await import(pathToFileURL(join(dir, 'src/pool.mjs')).href)
let seed = 5
const next = () => (seed = (seed * 48271) % 2147483647)
const days = ['2026-10-17', '2026-10-18']
for (let round = 0; round < 200; round++) {
  const pool = createPool()
  const model = new Map()
  let id = 0
  for (let step = 0; step < 30; step++) {
    const kind = next() % 3
    const day = days[next() % 2]
    if (kind === 0) {
      const lane = 1 + (next() % 4)
      const hour = 6 + (next() % 3)
      const taken = [...model.values()].some(
        (b) => b.day === day && b.lane === lane && b.hour === hour,
      )
      const booking = { id: `x${id++}`, club: 'C', lane, day, hour }
      const result = pool.book({ ...booking })
      assert.equal(
        result.ok,
        !taken,
        `round ${round} step ${step}: book ${JSON.stringify(booking)}`,
      )
      if (!taken) model.set(booking.id, booking)
    } else if (kind === 1) {
      const target = `x${next() % (id + 1)}`
      assert.equal(pool.cancel(target), model.delete(target), `round ${round}: cancel ${target}`)
    } else {
      const want = [1, 2, 3, 4].map((lane) => ({
        lane,
        hours: [6, 7, 8].filter(
          (hour) =>
            ![...model.values()].some((b) => b.day === day && b.lane === lane && b.hour === hour),
        ),
      }))
      assert.deepEqual(pool.free(day), want, `round ${round} step ${step}: free ${day}`)
    }
  }
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
