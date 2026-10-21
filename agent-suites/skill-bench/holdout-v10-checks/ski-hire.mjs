// Hidden acceptance for hireCost and --invoice: hireCost charges each item by the day with every
// complete week at the week rate and the leftover days capped at the week rate, makes poles free
// alongside skis and boots, gives children 70% of the total rounded half a penny up (in whole-pence
// arithmetic, so 2575 becomes 1803), refuses bad bookings with a RangeError naming the booking and
// non-objects with a TypeError; the bookings command prints an invoice per booking, exits 1 with
// nothing on stdout for a bad booking and 2 for a missing or unknown id, writes `hire: ` on every
// stderr line, and is unchanged without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { hireCost } = await import(pathToFileURL(join(dir, 'src/cost.mjs')).href)
const prices = JSON.parse(readFileSync(join(dir, 'data/prices.json'), 'utf8'))
const itemCost = ({ day, week }, days) =>
  Math.floor(days / 7) * week + Math.min((days % 7) * day, week)
const expected = (days, kit, child) => {
  const free = kit.includes('skis') && kit.includes('boots')
  const full = kit.reduce(
    (sum, item) => sum + (item === 'poles' && free ? 0 : itemCost(prices[item], days)),
    0,
  )
  return child ? Math.floor((full * 7 + 5) / 10) : full
}
const kits = [
  ['skis'],
  ['poles'],
  ['sledge'],
  ['skis', 'boots'],
  ['skis', 'boots', 'poles'],
  ['poles', 'helmet', 'boots', 'skis'],
  ['skis', 'poles'],
  ['boots', 'poles'],
  ['snowboard', 'boots', 'helmet'],
  ['helmet', 'sledge'],
]
for (const kit of kits)
  for (let days = 1; days <= 28; days++)
    for (const child of [undefined, false, true]) {
      const booking = { id: 'T1', name: 'Test', days, kit: [...kit] }
      if (child !== undefined) booking.child = child
      assert.equal(
        hireCost(booking, prices),
        expected(days, kit, child),
        `${kit.join('+')} for ${days} days${child ? ' (child)' : ''}`,
      )
    }
for (const [days, kit, child, pence] of [
  [5, ['skis'], false, 8750],
  [6, ['skis'], false, 8750],
  [8, ['skis'], false, 10500],
  [12, ['skis'], false, 17500],
  [15, ['skis'], false, 19250],
  [4, ['poles'], false, 1100],
  [1, ['skis', 'boots'], true, 1803],
  [9, ['snowboard', 'boots', 'helmet'], true, 15754],
  [5, ['sledge'], true, 1908],
  [15, ['skis', 'poles'], true, 15208],
])
  assert.equal(hireCost({ id: 'T2', name: 'Test', days, kit, child }, prices), pence)
for (const [field, value] of [
  ['days', 0],
  ['days', 29],
  ['days', -1],
  ['days', 2.5],
  ['days', '3'],
  ['days', NaN],
  ['days', Infinity],
  ['days', null],
  ['days', undefined],
  ['kit', []],
  ['kit', 'skis'],
  ['kit', undefined],
  ['kit', ['skis', 'goggles']],
  ['kit', ['skis', 'boots', 'skis']],
  ['kit', ['Skis']],
  ['kit', ['toString']],
  ['kit', ['constructor', 'boots']],
  ['kit', ['__proto__']],
  ['child', 'yes'],
  ['child', 1],
]) {
  const booking = { id: 'Q42', name: 'Test', days: 3, kit: ['skis', 'boots'], [field]: value }
  if (value === undefined) delete booking[field]
  assert.throws(
    () => hireCost(booking, prices),
    (error) => error instanceof RangeError && error.message.includes('Q42'),
    `${field} ${JSON.stringify(value) ?? String(value)} is refused with a RangeError naming the booking`,
  )
}
for (const value of [null, undefined, 'H201', 3, ['skis']])
  assert.throws(
    () => hireCost(value, prices),
    TypeError,
    `${String(value)} is refused with a TypeError`,
  )

const run = (...args) =>
  spawnSync(process.execPath, ['bin/bookings.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const listing = [
  'H201  Ruth Abbott     6d  skis, boots, poles',
  'H202  Sam Abbott      6d  skis, boots, poles, helmet',
  'H203  Tom Baird       1d  skis, boots',
  'H204  Una Cole        8d  snowboard, boots, helmet',
  'H205  Vic Dale        9d  snowboard, boots, helmet',
  'H206  Wyn Ellis      14d  skis, poles',
  'H207  Xan Ford        5d  sledge',
  'H208  Yas Gill       29d  skis, boots',
  'H209  Zoe Hart        3d  skis, boots, skis',
  'H210  Amy Iles        2d  skis, goggles',
  'H211  Bo Jack         4d  poles',
  'H212  Cal Kerr        7d  boots, poles',
]
const plain = run()
assert.equal(plain.stdout, listing.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [id, lines] of [
  ['H201', ['skis  £87.50', 'boots  £41.25', 'poles  free', 'Total  £128.75']],
  [
    'h202',
    [
      'skis  £87.50',
      'boots  £41.25',
      'poles  free',
      'helmet  £19.75',
      'Child discount  -£44.55',
      'Total  £103.95',
    ],
  ],
  ['H203', ['skis  £17.50', 'boots  £8.25', 'Child discount  -£7.72', 'Total  £18.03']],
  ['H204', ['snowboard  £119.70', 'boots  £49.50', 'helmet  £23.70', 'Total  £192.90']],
  [
    ' H205 ',
    [
      'snowboard  £139.65',
      'boots  £57.75',
      'helmet  £27.65',
      'Child discount  -£67.51',
      'Total  £157.54',
    ],
  ],
  ['H206', ['skis  £175.00', 'poles  £22.00', 'Total  £197.00']],
  ['H207', ['sledge  £27.25', 'Child discount  -£8.17', 'Total  £19.08']],
  ['H211', ['poles  £11.00', 'Total  £11.00']],
  ['H212', ['boots  £41.25', 'poles  £11.00', 'Total  £52.25']],
]) {
  const result = run('--invoice', id)
  assert.equal(result.status, 0, `--invoice ${id} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--invoice ${JSON.stringify(id)}`)
  for (const line of stderrLines(result)) assert.match(line, /^hire: /)
}
for (const [args, status] of [
  [['--invoice', 'H208'], 1],
  [['--invoice', 'H209'], 1],
  [['--invoice', 'H210'], 1],
  [['--invoice'], 2],
  [['--invoice', 'H299'], 2],
  [['--invoice', ''], 2],
  [['--invoice', '  '], 2],
]) {
  const result = run(...args)
  assert.equal(result.status, status, `${JSON.stringify(args)} exits ${status}`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^hire: /, 'stderr lines start with "hire: "')
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
