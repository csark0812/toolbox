// Development check for the hill race: places go by adjusted time, a runner aged exactly 50
// gets the three-minute allowance, the data is untouched and tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const race = JSON.parse(readFileSync(join(dir, 'data/runners.json'), 'utf8'))
assert.deepEqual(
  race.runners.map((r) => `${r.name} ${r.age} ${r.finish} ${r.missed.join(',')}`),
  [
    'Ella Moor 34 11:02:10 3',
    'Huw Pryce 50 11:06:40 ',
    'Gwen Tate 41 11:04:30 ',
    'Iolo Bane 62 11:09:00 ',
    'Rhys Dunn 28 11:05:20 ',
    'Nia Ford 55 11:08:50 ',
  ],
  'the race data is left as the marshals recorded it',
)
const out = execFileSync(process.execPath, ['bin/results.mjs'], { cwd: dir, encoding: 'utf8' })
const order = ['Iolo Bane', 'Huw Pryce', 'Gwen Tate', 'Rhys Dunn', 'Nia Ford', 'Ella Moor']
const adjusted = ['63:00', '63:40', '64:30', '65:20', '65:50', '72:10']
const lines = out.split('\n').filter((line) => order.some((name) => line.includes(name)))
assert.deepEqual(
  lines.map((line) => order.find((name) => line.includes(name))),
  order,
  'places go by adjusted time',
)
lines.forEach((line, i) => assert.match(line, new RegExp(`${adjusted[i]}\\s*$`), line))
assert.match(lines[1], /3:00/, 'a runner aged 50 gets the three-minute allowance')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
