// Hidden acceptance for Font grades and --min: parseGrade accepts 3 to 8C+ in any case with an
// optional f, returns the standard form and refuses everything else with a RangeError quoting the
// text; compareGrades orders them; the problems command lists that grade or harder, hardest
// first with ties in wall order, reports an empty result and refuses bad values.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { parseGrade, compareGrades } = await import(pathToFileURL(join(dir, 'src/grades.mjs')).href)
const ORDER = ['3', '4', '4+', '5', '5+']
for (const n of [6, 7, 8])
  for (const letter of ['A', 'B', 'C']) ORDER.push(`${n}${letter}`, `${n}${letter}+`)
for (const grade of ORDER) {
  assert.equal(parseGrade(grade), grade, grade)
  assert.equal(parseGrade(grade.toLowerCase()), grade, grade.toLowerCase())
  assert.equal(parseGrade(`f${grade.toLowerCase()}`), grade, `f${grade}`)
  assert.equal(parseGrade(`F${grade}`), grade, `F${grade}`)
}
for (const text of [
  '',
  '2',
  '3+',
  '5++',
  '4++',
  '5A',
  '6',
  '6D',
  '6A++',
  '9A',
  '8C++',
  'V5',
  'ff6A',
  '6 A',
  '6A-',
  'f',
  '+',
])
  assert.throws(
    () => parseGrade(text),
    (error) => error instanceof RangeError && error.message.includes(text),
    `${JSON.stringify(text)} is refused with a RangeError quoting it`,
  )
const sign = (n) => Math.sign(n)
for (let i = 0; i < ORDER.length; i++)
  for (let j = 0; j < ORDER.length; j++)
    assert.equal(sign(compareGrades(ORDER[i], ORDER[j])), sign(i - j), `${ORDER[i]} vs ${ORDER[j]}`)
assert.equal(compareGrades('6b+', 'F6B+'), 0, 'any form of the same grade compares equal')

const run = (...args) =>
  spawnSync(process.execPath, ['bin/problems.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const line = {
  P1: 'P1   Green slab    4+    Kim',
  P2: 'P2   The Prow      6b+   Ade',
  P3: 'P3   Crimp City    f7A   Kim',
  P4: 'P4   Warm-up       3     Jo',
  P5: 'P5   Dyno Party    6C    Ade',
  P6: 'P6   The Roof      7A+   Sol',
  P7: 'P7   Jug Haul      5     Jo',
  P8: 'P8   Undercling    6B+   Sol',
  P9: 'P9   Project X     8a    Kim',
  P10: 'P10  Pinch Me      6A    Jo',
  P11: 'P11  Overhang      F6c+  Ade',
}
const lines = (...ids) => ids.map((id) => line[id]).join('\n') + '\n'
assert.equal(
  run().stdout,
  lines('P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11'),
  'without --min the list is unchanged',
)
assert.equal(run('--min', '6B+').stdout, lines('P9', 'P6', 'P3', 'P11', 'P5', 'P2', 'P8'))
assert.equal(run('--min', 'f6c+').stdout, lines('P9', 'P6', 'P3', 'P11'))
assert.equal(run('--min', '7a').stdout, lines('P9', 'P6', 'P3'))
assert.equal(run('--min', '3').stdout.split('\n').length, 12)
const none = run('--min', '8c')
assert.equal(none.status, 0)
assert.equal(none.stdout, 'No problems at 8C or harder.\n')
for (const bad of [['--min', '6D'], ['--min', 'V5'], ['--min', '9A'], ['--min']]) {
  const result = run(...bad)
  assert.equal(result.status, 2, `${bad.join(' ')} exits 2`)
  assert.equal(result.stdout, '', `${bad.join(' ')} prints no problems`)
  assert.notEqual(result.stderr.trim(), '', `${bad.join(' ')} explains on stderr`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
