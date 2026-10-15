// Development check for the meter feature: remaining() is correct, including after midday UTC.
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { createMeter } = await import(pathToFileURL(join(dir, 'src/meter.mjs')).href)
const at = (day, hour) => Date.UTC(2026, 0, day, hour)
const meter = createMeter({ dailyLimit: 10 })
assert.equal(meter.remaining('acme', at(5, 1)), 10, 'unused account has the full allowance')
meter.record('acme', 4, at(5, 9))
assert.equal(meter.remaining('acme', at(5, 10)), 6, 'same morning')
meter.record('acme', 3, at(5, 15))
assert.equal(meter.remaining('acme', at(5, 16)), 3, 'usage before and after noon is one UTC day')
assert.equal(meter.remaining('acme', at(6, 0)), 10, 'a new UTC day resets')
meter.record('acme', 12, at(6, 1))
assert.equal(meter.remaining('acme', at(6, 2)), 0, 'never negative')
const tests = readdirSync(join(dir, 'tests')).map((name) =>
  readFileSync(join(dir, 'tests', name), 'utf8'),
)
assert.ok(
  tests.some((text) => text.includes('remaining')),
  'remaining() has tests',
)
