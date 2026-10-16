// Hidden acceptance for the allotment invoice run: every plot in a batch is charged exactly what
// it is charged on its own, in any order and in one process, and the season total is the sum of
// the lines.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { annualFee } = await import(pathToFileURL(join(dir, 'src/fees.mjs')).href)

const expected = [
  'Plot  1  Ada Okafor    125 m²   £58.00',
  'Plot  4  Ben Hollis    250 m²   £98.00',
  'Plot  9  Gwen Price    125 m²   £38.00',
  'Plot 14  Ines Duarte   250 m²   £98.00',
  'Plot 17  Kofi Mensah    60 m²   £32.40',
  'Plot 21  Lena Brandt   125 m²   £58.00',
  'Plot 23  Moira Walsh   250 m²   £58.00',
  'Plot 30  Raj Patel     125 m²   £58.00',
  'Season total £498.40',
  '',
].join('\n')
assert.equal(
  execFileSync(process.execPath, ['bin/invoices.mjs'], { cwd: dir, encoding: 'utf8' }),
  expected,
  'the invoice run',
)
for (const [plot, line] of [
  [14, 3],
  [9, 2],
])
  assert.equal(
    execFileSync(process.execPath, ['bin/fee.mjs', String(plot)], { cwd: dir, encoding: 'utf8' }),
    `${expected.split('\n')[line]}\n`,
    `fee for plot ${plot}`,
  )

// One process, any order: a fee depends only on its own plot.
const reference = (plot) =>
  Math.round(plot.area * 32 * (1 - ({ pensioner: 0.5, student: 0.25 }[plot.concession] ?? 0))) +
  1800
let seed = 5
const next = () => (seed = (seed * 48271) % 2147483647)
for (let i = 0; i < 400; i++) {
  const plot = {
    plot: i,
    holder: 'x',
    area: 10 + (next() % 300),
    ...(next() % 3 === 0 ? {} : { concession: ['pensioner', 'student'][next() % 2] }),
  }
  const copy = structuredClone(plot)
  assert.equal(annualFee(plot), reference(plot), `call ${i}: ${JSON.stringify(plot)}`)
  assert.deepEqual(plot, copy, 'the plot is not changed')
}
assert.throws(() => annualFee({ plot: 1, area: 10, concession: 'vip' }), RangeError)
assert.equal(annualFee({ plot: 1, area: 125 }), 5800, 'a refused concession leaves nothing behind')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
