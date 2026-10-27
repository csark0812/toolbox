// Development check for the merged breed tally: one copy of the counting loop remains, and the
// day and fair totals print exactly what they printed before, withdrawn fleeces included.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const run = (...args) =>
  execFileSync(process.execPath, args, { cwd: dir, encoding: 'utf8', stdio: 'pipe' })

assert.equal(
  run('bin/day.mjs', '1'),
  `Fellside Wool Fair, day 1
Herdwick     3 fleeces    4.5 kg  mean 1.50
Jacob        3 fleeces    6.7 kg  mean 2.23
Swaledale    2 fleeces    6.1 kg  mean 3.05
`,
)
assert.equal(
  run('bin/day.mjs', '2'),
  `Fellside Wool Fair, day 2
Herdwick     2 fleeces    4.8 kg  mean 2.40
Jacob        1 fleeces    3.3 kg  mean 3.30
Shetland     1 fleeces    1.4 kg  mean 1.40
Swaledale    2 fleeces    3.4 kg  mean 1.70
`,
)
assert.equal(
  run('bin/fair.mjs'),
  `Fellside Wool Fair, all days
Herdwick     4 fleeces    9.3 kg  mean 2.33
Jacob        3 fleeces   10.0 kg  mean 3.33
Shetland     1 fleeces    1.4 kg  mean 1.40
Swaledale    3 fleeces    9.5 kg  mean 3.17
`,
)

const counting = readdirSync(join(dir, 'src'), { recursive: true })
  .filter((file) => String(file).endsWith('.mjs'))
  .filter((file) => /\+\+|\+=/.test(readFileSync(join(dir, 'src', String(file)), 'utf8')))
assert.ok(counting.length <= 1, `the tally loop is still written in ${counting.join(' and ')}`)
run('--test')
