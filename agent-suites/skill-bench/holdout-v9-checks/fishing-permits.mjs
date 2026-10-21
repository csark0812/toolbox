// Hidden acceptance for the permit options refactor: quotePermit takes one options object and
// nothing in the project calls it positionally (bound, spread or applied calls included), every
// command prints exactly what it did, the defaults behave as before when options are left out or
// passed as undefined, and the public entry the booking page uses keeps its positional calls.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const QUOTE = [
  [[], 'Club lake: 1 day, adult, 1 rod = £9.00\n', '', 0],
  [['kennet'], 'Kennet (Hungerford beat): 1 day, adult, 1 rod = £32.00\n', '', 0],
  [['kennet', '3'], 'Kennet (Hungerford beat): 3 days, adult, 1 rod = £96.00\n', '', 0],
  [
    ['kennet', '3', 'senior', '2'],
    'Kennet (Hungerford beat): 3 days, senior, 2 rods = £144.00\n',
    '',
    0,
  ],
  [
    ['kennet', '3', 'senior', '2', 'yes'],
    'Kennet (Hungerford beat): 3 days, senior, 2 rods, concession = £129.60\n',
    '',
    0,
  ],
  [
    ['kennet', '2', 'junior'],
    'Kennet (Hungerford beat): 2 days, junior, 1 rod, concession = £28.80\n',
    '',
    0,
  ],
  [
    ['kennet', '2', 'junior', '1', 'no'],
    'Kennet (Hungerford beat): 2 days, junior, 1 rod = £32.00\n',
    '',
    0,
  ],
  [
    ['kennet', '2', 'junior', '1', 'yes'],
    'Kennet (Hungerford beat): 2 days, junior, 1 rod, concession = £28.80\n',
    '',
    0,
  ],
  [['test'], 'Test (Longstock): 2 days, adult, 1 rod = £110.00\n', '', 0],
  [['test', '1'], 'Test (Longstock): 2 days, adult, 1 rod = £110.00\n', '', 0],
  [
    ['test', '9', 'senior', '1', 'yes'],
    'Test (Longstock): 9 days, senior, 1 rod, concession = £284.01\n',
    '',
    0,
  ],
  [['test', '2', 'adult', '2'], '', 'Test (Longstock) allows at most 1 rods\n', 1],
  [['avon', '7', 'adult', '3'], 'Avon (Ringwood): 7 days, adult, 3 rods = £321.30\n', '', 0],
  [['avon', '0'], 'Avon (Ringwood): 1 day, adult, 1 rod = £18.00\n', '', 0],
  [['lake', '30', 'junior', '4', 'no'], 'Club lake: 30 days, junior, 4 rods = £459.00\n', '', 0],
  [['lake', '6', 'senior', '4'], 'Club lake: 6 days, senior, 4 rods = £162.00\n', '', 0],
  [['trent', '2'], '', 'Unknown water: trent\n', 1],
  [['kennet', '2', 'child'], '', 'Unknown angler type: child\n', 1],
]
const CHEAPEST = [
  [
    [],
    'Club lake: 1 day, adult, 1 rod = £9.00\nAvon (Ringwood): 1 day, adult, 1 rod = £18.00\nKennet (Hungerford beat): 1 day, adult, 1 rod = £32.00\nTest (Longstock): 2 days, adult, 1 rod = £110.00\n',
  ],
  [
    ['3', 'junior'],
    'Club lake: 3 days, junior, 1 rod, concession = £12.15\nAvon (Ringwood): 3 days, junior, 1 rod, concession = £24.30\nKennet (Hungerford beat): 3 days, junior, 1 rod, concession = £43.20\nTest (Longstock): 3 days, junior, 1 rod, concession = £74.25\n',
  ],
  [
    ['1'],
    'Club lake: 1 day, adult, 1 rod = £9.00\nAvon (Ringwood): 1 day, adult, 1 rod = £18.00\nKennet (Hungerford beat): 1 day, adult, 1 rod = £32.00\nTest (Longstock): 2 days, adult, 1 rod = £110.00\n',
  ],
  [
    ['8', 'senior'],
    'Club lake: 8 days, senior, 1 rod = £45.90\nAvon (Ringwood): 8 days, senior, 1 rod = £91.80\nKennet (Hungerford beat): 8 days, senior, 1 rod = £163.20\nTest (Longstock): 8 days, senior, 1 rod = £280.50\n',
  ],
  [
    ['14', 'adult'],
    'Club lake: 14 days, adult, 1 rod = £107.10\nAvon (Ringwood): 14 days, adult, 1 rod = £214.20\nKennet (Hungerford beat): 14 days, adult, 1 rod = £380.80\nTest (Longstock): 14 days, adult, 1 rod = £654.50\n',
  ],
]
const BULK =
  'P101  Kennet (Hungerford beat): 3 days, adult, 1 rod = £96.00\nP102  Avon (Ringwood): 1 day, junior, 1 rod, concession = £8.10\nP103  REJECTED: Test (Longstock) allows at most 1 rods\nP104  Avon (Ringwood): 7 days, adult, 3 rods = £321.30\nP105  Test (Longstock): 2 days, junior, 1 rod, concession = £49.50\nP106  Club lake: 10 days, adult, 4 rods = £306.00\nP107  Kennet (Hungerford beat): 14 days, senior, 1 rod = £285.60\nP108  REJECTED: Unknown water: trent\n'
const RENEWALS =
  'M012  Kennet (Hungerford beat): 7 days, senior, 1 rod = £142.80\nM027  Test (Longstock): 2 days, adult, 1 rod = £110.00\nM031  Avon (Ringwood): 3 days, junior, 2 rods, concession = £48.60\nM044  Club lake: 182 days, adult, 1 rod, concession = £1253.07\nM058  Kennet (Hungerford beat): 2 days, junior, 1 rod = £32.00\n'

// The pricing as it was, positional, for comparison.
const WATERS = {
  kennet: { name: 'Kennet (Hungerford beat)', dayRate: 3200, minDays: 1, rodLimit: 2 },
  test: { name: 'Test (Longstock)', dayRate: 5500, minDays: 2, rodLimit: 1 },
  avon: { name: 'Avon (Ringwood)', dayRate: 1800, minDays: 1, rodLimit: 3 },
  lake: { name: 'Club lake', dayRate: 900, minDays: 1, rodLimit: 4 },
}
const RATES = { adult: 1, senior: 0.75, junior: 0.5 }
function before(
  water,
  days = WATERS[water]?.minDays,
  angler = 'adult',
  rods = 1,
  concession = angler === 'junior',
) {
  const site = WATERS[water]
  if (!site) throw new Error(`Unknown water: ${water}`)
  if (!(angler in RATES)) throw new Error(`Unknown angler type: ${angler}`)
  if (rods > site.rodLimit) throw new Error(`${site.name} allows at most ${site.rodLimit} rods`)
  const billed = Math.max(days, site.minDays)
  let pence = site.dayRate * billed * rods * RATES[angler]
  if (billed >= 7) pence *= 0.85
  if (concession) pence *= 0.9
  return { water: site.name, days: billed, angler, rods, concession, pence: Math.round(pence) }
}
const outcome = (fn) => {
  try {
    return { ok: fn() }
  } catch (error) {
    return { error: error.message }
  }
}

const node = (args) => spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8' })
for (const [args, stdout, stderr, status] of QUOTE) {
  const run = node(['bin/quote.mjs', ...args])
  assert.deepEqual(
    [run.stdout, run.stderr, run.status],
    [stdout, stderr, status],
    `npm run quote -- ${args.join(' ')}`,
  )
}
for (const [args, stdout] of CHEAPEST)
  assert.equal(
    node(['bin/cheapest.mjs', ...args]).stdout,
    stdout,
    `npm run cheapest -- ${args.join(' ')}`,
  )
assert.equal(node(['bin/bulk.mjs']).stdout, BULK, 'npm run bulk')
assert.equal(node(['bin/renewals.mjs']).stdout, RENEWALS, 'npm run renewals')

const load = (path) => import(pathToFileURL(join(dir, path)).href)
const { quotePermit } = await load('src/permits.mjs')
const grid = []
for (const water of ['kennet', 'test', 'avon', 'lake', 'trent'])
  for (const days of [undefined, 0, 1, 2, 7, 10])
    for (const angler of [undefined, 'adult', 'senior', 'junior', 'child'])
      for (const rods of [undefined, 1, 2, 4])
        for (const concession of [undefined, true, false])
          grid.push([water, days, angler, rods, concession])
for (const [water, days, angler, rods, concession] of grid) {
  const expected = outcome(() => before(water, days, angler, rods, concession))
  const label = JSON.stringify({ water, days, angler, rods, concession })
  assert.deepEqual(
    outcome(() => quotePermit({ water, days, angler, rods, concession })),
    expected,
    `options ${label}`,
  )
  const present = Object.fromEntries(
    Object.entries({ water, days, angler, rods, concession }).filter(
      ([, value]) => value !== undefined,
    ),
  )
  assert.deepEqual(
    outcome(() => quotePermit(present)),
    expected,
    `options without undefined keys ${label}`,
  )
}
assert.throws(() => quotePermit('kennet', 3), 'the positional form is gone')

const { priceFor, quote, seasonTicket, weekTicket } = await load('src/index.mjs')
const formatPence = (pence) => `£${(pence / 100).toFixed(2)}`
for (const [water, days, angler, rods, concession] of grid) {
  const label = JSON.stringify([water, days, angler, rods, concession])
  assert.deepEqual(
    outcome(() => quote(water, days, angler, rods, concession)),
    outcome(() => before(water, days, angler, rods, concession)),
    `the booking page's quote${label}`,
  )
  assert.deepEqual(
    outcome(() => priceFor(water, days, angler)),
    outcome(() => formatPence(before(water, days, angler).pence)),
    `the booking page's priceFor${label}`,
  )
  assert.deepEqual(
    outcome(() => seasonTicket(water, angler)),
    outcome(() => before(water, 182, angler, undefined, true)),
  )
  assert.deepEqual(
    outcome(() => weekTicket(water, angler)),
    outcome(() => before(water, 7, angler, undefined, false)),
  )
}
const { lakeDayTicket } = await load('src/presets.mjs')
assert.deepEqual(lakeDayTicket(), before('lake', 1))

// No positional, bound, applied or spread call to quotePermit is left anywhere in the project.
const files = []
const walk = (path) => {
  for (const name of readdirSync(path)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(path, name)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(m?js|cjs)$/.test(name)) files.push(full)
  }
}
walk(dir)
const topLevelArgs = (text) => {
  let depth = 0
  let quoteChar = null
  let count = text.trim() ? 1 : 0
  for (const char of text) {
    if (quoteChar) {
      if (char === quoteChar) quoteChar = null
    } else if (`'"\``.includes(char)) quoteChar = char
    else if ('([{'.includes(char)) depth++
    else if (')]}'.includes(char)) depth--
    else if (char === ',' && depth === 0) count++
  }
  return text.trim().endsWith(',') ? count - 1 : count
}
for (const file of files) {
  const source = readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/^\s*(import|export)\s*\{[^}]*\}[^\n]*$/gm, '')
  for (const match of source.matchAll(/\bquotePermit\b/g)) {
    const before = source.slice(Math.max(0, match.index - 9), match.index)
    const after = source.slice(match.index + match[0].length)
    if (/function\s*$/.test(before)) continue
    if (/^\s*[=:]/.test(after) && !/^\s*==/.test(after)) continue
    const where = `${file.slice(dir.length + 1)}: ${source.slice(match.index, match.index + 60).split('\n')[0]}`
    assert.ok(
      after.startsWith('('),
      `quotePermit is only called directly, with one options object (${where})`,
    )
    let depth = 0
    let end = 0
    for (; end < after.length; end++) {
      if (after[end] === '(') depth++
      else if (after[end] === ')' && --depth === 0) break
    }
    const args = after.slice(1, end)
    assert.ok(
      topLevelArgs(args) === 1 && !args.trim().startsWith('...'),
      `one options object per call (${where})`,
    )
  }
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
