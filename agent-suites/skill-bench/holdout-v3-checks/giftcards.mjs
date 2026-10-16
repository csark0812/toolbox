// Hidden acceptance for gift card redemption: code matching that ignores case, spaces and dashes,
// partial charges, the returned shape, history entries, and every rejection the request names
// (unknown code, expired at the expiry instant, empty card, bad amounts) leaving the card untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
/** True when `fn` throws anything. */
const rejects = (fn) => {
  try {
    fn()
  } catch {
    return true
  }
  return false
}
const { issueCard, redeem } = await import(pathToFileURL(join(dir, 'src/cards.mjs')).href)
const { createStore } = await import(pathToFileURL(join(dir, 'src/store.mjs')).href)
const T = Date.UTC(2026, 9, 15, 12)
const setup = () => {
  const store = createStore()
  const card = issueCard(store, { code: 'GIFT-2026-AB12', balanceCents: 5000, expiresAt: T + 1000 })
  return { store, card }
}
{
  const { store, card } = setup()
  assert.deepEqual(redeem(store, 'GIFT-2026-AB12', 1250, T), {
    chargedCents: 1250,
    remainingCents: 3750,
  })
  assert.deepEqual(redeem(store, 'gift 2026 ab12', 1000, T + 1), {
    chargedCents: 1000,
    remainingCents: 2750,
  })
  assert.deepEqual(redeem(store, ' gift2026-AB12 ', 9999, T + 2), {
    chargedCents: 2750,
    remainingCents: 0,
  })
  assert.equal(card.balanceCents, 0)
  assert.deepEqual(card.history, [
    { at: T, chargedCents: 1250 },
    { at: T + 1, chargedCents: 1000 },
    { at: T + 2, chargedCents: 2750 },
  ])
  assert.ok(
    rejects(() => redeem(store, 'GIFT-2026-AB12', 100, T + 3)),
    'an empty card throws',
  )
  assert.equal(card.history.length, 3)
}
{
  const { store, card } = setup()
  const untouched = () => {
    assert.equal(card.balanceCents, 5000)
    assert.deepEqual(card.history, [])
  }
  for (const [code, amount, now, why] of [
    ['GIFT-2026-AB13', 100, T, 'unknown code'],
    ['GIFT-2026-AB12', 100, T + 1000, 'expired at the expiry instant'],
    ['GIFT-2026-AB12', 100, T + 5000, 'expired'],
    ['GIFT-2026-AB12', 0, T, 'zero amount'],
    ['GIFT-2026-AB12', -5, T, 'negative amount'],
    ['GIFT-2026-AB12', 12.5, T, 'fractional cents'],
    ['GIFT-2026-AB12', NaN, T, 'NaN amount'],
  ]) {
    assert.ok(
      rejects(() => redeem(store, code, amount, now)),
      why,
    )
    untouched()
  }
  assert.deepEqual(redeem(store, 'GIFT-2026-AB12', 1, T + 999), {
    chargedCents: 1,
    remainingCents: 4999,
  })
}
{
  const store = createStore()
  const card = issueCard(store, { code: 'GIFT-2099-ZZ99', balanceCents: 5000, expiresAt: 4e12 })
  const before = Date.now()
  redeem(store, 'GIFT-2099-ZZ99', 10)
  assert.equal(card.balanceCents, 4990, 'now is optional')
  const at = card.history[0].at
  assert.ok(at >= before && at <= Date.now(), 'history records the default time')
}
const ownTests = readdirSync(join(dir, 'tests'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .filter((text) => /redeem/.test(text))
assert.ok(ownTests.length > 0, 'the feature ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
