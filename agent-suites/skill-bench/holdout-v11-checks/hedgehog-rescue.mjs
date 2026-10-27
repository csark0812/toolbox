// Hidden acceptance for the hedgehog release list: the latest weigh-in is found by real date
// whether it came from the office PC (2026-10-14) or the tablet (14/10/2026, day first, no
// padding), 600 g itself is ready, every hog gets its true status, and the tests pass.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
assert.equal(
  execFileSync(process.execPath, ['bin/ready.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'Hazel     655 g  ready',
    'Bramble   640 g  ready',
    'Pip       570 g  not ready',
    'Thistle   600 g  ready',
    'Conker    630 g  ready',
    'Juniper   530 g  not ready',
    'Sorrel    720 g  ready',
    'Moss      599 g  not ready',
    '',
  ].join('\n'),
  'every hog gets its true latest weight and status',
)
const { releaseStatus } = await import(pathToFileURL(join(dir, 'src/release.mjs')).href)
const status = (...weighIns) => {
  const { grams, ready } = releaseStatus({
    name: 'T',
    weighIns: weighIns.map(([date, grams]) => ({ date, grams })),
  })
  return `${grams} ${ready ? 'ready' : 'not ready'}`
}
assert.equal(
  status(['2026-10-05', 590], ['9/10/2026', 610]),
  '610 ready',
  'tablet dates are day first',
)
assert.equal(
  status(['9/10/2026', 610], ['2026-10-05', 590]),
  '610 ready',
  'entry order does not matter',
)
assert.equal(status(['2026-10-31', 640], ['1/11/2026', 580]), '580 not ready', 'month boundary')
assert.equal(status(['12/1/2027', 590], ['2026-12-20', 620]), '590 not ready', 'year boundary')
assert.equal(
  status(['5/10/2026', 620], ['20/9/2026', 500], ['2/10/2026', 560]),
  '620 ready',
  'all tablet',
)
assert.equal(
  status(['2026-10-01', 650], ['2026-10-03', 600]),
  '600 ready',
  'exactly 600 g is ready',
)
assert.equal(status(['2026-10-03', 599.5]), '599.5 not ready', 'under 600 g is not')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
