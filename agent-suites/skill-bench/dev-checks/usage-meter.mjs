// Development check for the meter feature: remaining(account, nowMs) is the units left in the
// current UTC calendar day, never negative, across day boundaries (midday, the last millisecond,
// midnight), overuse and awkward account names; record() still works; the tests pass and they
// catch the midday bucketing bug and a negative remainder.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { createMeter } = await import(pathToFileURL(join(dir, 'src/meter.mjs')).href)
const at = (day, hour, minute = 0, second = 0, ms = 0) =>
  Date.UTC(2026, 0, day, hour, minute, second, ms)

// The examples in the prompt and criteria.
{
  const meter = createMeter({ dailyLimit: 10 })
  assert.equal(meter.remaining('acme', at(5, 1)), 10, 'unused account has the full allowance')
  meter.record('acme', 4, at(5, 9))
  assert.equal(meter.remaining('acme', at(5, 10)), 6, 'same morning')
  meter.record('acme', 3, at(5, 15))
  assert.equal(meter.remaining('acme', at(5, 16)), 3, 'usage before and after noon is one UTC day')
  assert.equal(meter.remaining('acme', at(6, 0)), 10, 'a new UTC day resets')
  meter.record('acme', 12, at(6, 1))
  assert.equal(meter.remaining('acme', at(6, 2)), 0, 'never negative')
}

// Day boundaries: 11:59:59.999, 12:00, 23:59:59.999 and 00:00 the next day.
{
  const meter = createMeter({ dailyLimit: 10 })
  meter.record('acme', 2, at(5, 0))
  meter.record('acme', 1, at(5, 11, 59, 59, 999))
  meter.record('acme', 1, at(5, 12))
  meter.record('acme', 1, at(5, 23, 59, 59, 999))
  assert.equal(meter.remaining('acme', at(5, 23, 59, 59, 999)), 5, 'a whole UTC day is one bucket')
  assert.equal(meter.remaining('acme', at(5, 12)), 5, 'midday belongs to the same day')
  assert.equal(meter.remaining('acme', at(6, 0)), 10, 'midnight starts a fresh day')
  meter.record('acme', 3, at(6, 0))
  assert.equal(meter.remaining('acme', at(6, 12, 30)), 7, 'afternoon sees the morning usage')
  assert.equal(meter.remaining('acme', at(7, 11, 59)), 10, 'the next morning resets')
}

// Afternoon usage must not leak into the next morning (the rounding bug).
{
  const meter = createMeter({ dailyLimit: 10 })
  meter.record('acme', 7, at(5, 18))
  assert.equal(meter.remaining('acme', at(6, 6)), 10, 'yesterday evening is not today')
  assert.equal(meter.remaining('acme', at(5, 20)), 3, 'evening usage counts the same evening')
}

// Exactly at the limit, over it and repeated overuse.
{
  const meter = createMeter({ dailyLimit: 5 })
  assert.equal(meter.record('acme', 5, at(5, 9)), true, 'reaching the limit is allowed')
  assert.equal(meter.remaining('acme', at(5, 9)), 0, 'exactly at the limit')
  assert.equal(meter.record('acme', 1, at(5, 10)), false, 'past the limit is refused')
  meter.record('acme', 100, at(5, 11))
  const left = meter.remaining('acme', at(5, 12))
  assert.ok(Object.is(left, 0), `never negative, not -0 (got ${left})`)
}

// Accounts are independent, including names that collide with object properties.
{
  const meter = createMeter({ dailyLimit: 10 })
  meter.record('acme', 4, at(5, 9))
  assert.equal(meter.remaining('globex', at(5, 9)), 10, 'another account is untouched')
  for (const name of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', ''])
    assert.equal(meter.remaining(name, at(5, 9)), 10, `unused account ${JSON.stringify(name)}`)
  meter.record('__proto__', 3, at(5, 9))
  assert.equal(meter.remaining('__proto__', at(5, 10)), 7, '__proto__ is an ordinary account')
  assert.equal(meter.remaining('acme', at(5, 10)), 6, 'acme is unaffected by __proto__')
}

// remaining() only reads: asking does not change the count.
{
  const meter = createMeter({ dailyLimit: 10 })
  meter.record('acme', 4, at(5, 9))
  for (let i = 0; i < 3; i++) meter.remaining('acme', at(5, 9))
  meter.remaining('acme', at(6, 9))
  assert.equal(meter.remaining('acme', at(5, 10)), 6, 'remaining() has no side effects')
}

// The project's tests pass.
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

// The tests pin remaining(): they must fail against a meter that rounds days (the shipped bug)
// and against one whose remainder goes negative.
const DAY = 86_400_000
const mutant = (dayOf, clamp) => `const DAY_MS = ${DAY}
export function createMeter({ dailyLimit }) {
  const usage = new Map()
  const dayOf = (nowMs) => ${dayOf}(nowMs / DAY_MS)
  const usedOn = (account, day) => {
    const entry = usage.get(account)
    return entry && entry.day === day ? entry.used : 0
  }
  return {
    record(account, units, nowMs) {
      const day = dayOf(nowMs)
      const used = usedOn(account, day) + units
      usage.set(account, { day, used })
      return used <= dailyLimit
    },
    remaining(account, nowMs) {
      const left = dailyLimit - usedOn(account, dayOf(nowMs))
      return ${clamp ? 'Math.max(0, left)' : 'left'}
    },
  }
}
`
const testsFailWith = (source) => {
  const copy = mkdtempSync(join(tmpdir(), 'meter-check-'))
  try {
    cpSync(dir, copy, { recursive: true, filter: (path) => !path.includes('node_modules') })
    writeFileSync(join(copy, 'src/meter.mjs'), source)
    execFileSync(process.execPath, ['--test'], { cwd: copy, stdio: 'pipe' })
    return false
  } catch {
    return true
  } finally {
    rmSync(copy, { recursive: true, force: true })
  }
}
if (!testsFailWith(mutant('Math.floor', true))) {
  assert.ok(testsFailWith(mutant('Math.round', true)), 'tests catch days that round at midday')
  assert.ok(testsFailWith(mutant('Math.floor', false)), 'tests catch a negative remainder')
} else {
  // The tests reach past createMeter() (for example an exported day helper), so the reference
  // meters cannot stand in. Put the rounding bug back into the solution itself instead.
  const own = readFileSync(join(dir, 'src/meter.mjs'), 'utf8')
  assert.match(own, /Math\.floor\(/, 'days are floored')
  assert.ok(
    testsFailWith(own.replaceAll('Math.floor(', 'Math.round(')),
    'tests catch days that round at midday',
  )
}
