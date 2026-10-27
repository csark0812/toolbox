// Development check for discount codes: parseDiscount reads a whole percentage from 1 to 90 or an
// amount off from £0.01 to £50 and refuses the rest with a RangeError, --discount comes off after
// the member saving, rounds down, never takes the total below £0.00, bad codes exit 2 with
// nothing on stdout, and the receipt without the option is unchanged.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseDiscount } = await import(pathToFileURL(join(dir, 'src/discount.mjs')).href)
for (const [text, expected] of [
  ['15%', { percent: 15 }],
  ['1%', { percent: 1 }],
  ['90%', { percent: 90 }],
  [' 10% ', { percent: 10 }],
  ['£2 off', { pence: 200 }],
  ['£2.50 OFF', { pence: 250 }],
  ['£2.5 off', { pence: 250 }],
  ['£0.01 off', { pence: 1 }],
  ['£19.99 off', { pence: 1999 }],
  ['£50 off', { pence: 5000 }],
])
  assert.deepEqual({ ...parseDiscount(text) }, expected, JSON.stringify(text))
for (const bad of [
  '0%',
  '91%',
  '12.5%',
  '-5%',
  '15',
  '£0 off',
  '£0.00 off',
  '£50.01 off',
  '£2',
  '2 off',
  '£2.555 off',
  '£-2 off',
  'ten',
  '',
]) {
  assert.throws(() => parseDiscount(bad), RangeError, JSON.stringify(bad))
  if (bad.trim())
    assert.throws(
      () => parseDiscount(bad),
      (error) => error.message.includes(bad),
      `the message includes ${JSON.stringify(bad)}`,
    )
}
const cli = (...args) =>
  spawnSync(process.execPath, ['bin/receipt.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const items =
  '  £4.50 Sourdough loaf\n  £7.80 Comte 200g\n  £3.25 Green olives\n  £6.15 Fennel salami\nSubtotal £21.70\n'
const tail = (stdout) => stdout.split('\n').filter((line) => /^(Member|Discount|Total) /.test(line))
for (const [args, expected] of [
  [
    ['--discount', '15%'],
    ['Discount -£3.25', 'Total £18.45'],
  ],
  [
    ['--discount', '33%'],
    ['Discount -£7.16', 'Total £14.54'],
  ],
  [
    ['--member', '--discount', '15%'],
    ['Member -£2.17', 'Discount -£2.92', 'Total £16.61'],
  ],
  [
    ['--discount', '15%', '--member'],
    ['Member -£2.17', 'Discount -£2.92', 'Total £16.61'],
  ],
  [
    ['--discount', '£5 off'],
    ['Discount -£5.00', 'Total £16.70'],
  ],
  [
    ['--discount', '£2.5 off'],
    ['Discount -£2.50', 'Total £19.20'],
  ],
  [
    ['--discount', '£50 off'],
    ['Discount -£21.70', 'Total £0.00'],
  ],
  [
    ['--member', '--discount', '£50 off'],
    ['Member -£2.17', 'Discount -£19.53', 'Total £0.00'],
  ],
]) {
  const result = cli(...args)
  assert.equal(result.status, 0, args.join(' '))
  assert.ok(result.stdout.startsWith(items), `${args.join(' ')}: items and subtotal unchanged`)
  assert.deepEqual(tail(result.stdout), expected, `${args.join(' ')}: ${result.stdout}`)
}
for (const bad of [
  ['--discount', '95%'],
  ['--discount'],
  ['--discount', 'half price'],
  ['--member', '--discount', '£60 off'],
]) {
  const result = cli(...bad)
  assert.equal(result.status, 2, bad.join(' '))
  assert.equal(result.stdout, '', bad.join(' '))
  assert.notEqual(result.stderr.trim(), '', bad.join(' '))
}
assert.equal(cli().stdout, `${items}Total £21.70\n`)
assert.equal(cli('--member').stdout, `${items}Member -£2.17\nTotal £19.53\n`)
assert.equal(cli().stderr, '', 'the plain receipt writes nothing to stderr')
assert.equal(spawnSync(process.execPath, ['--test'], { cwd: dir }).status, 0, 'tests pass')
