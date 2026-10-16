// Hidden acceptance for the weather-station batch: the Fahrenheit conversion, the no-data day, the
// --station option and the README fix all work at the branch head, each commit delivers at most one
// of them (probes run at every commit), nothing is left uncommitted, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const scratch = mkdtempSync(join(tmpdir(), 'weather-check-'))

const PROBE = `
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
const daily = (...args) => spawnSync(process.execPath, ['bin/weather.mjs', 'daily', ...args], { encoding: 'utf8' })
const result = {}
try {
  const { toCelsius } = await import(new URL('./src/units.mjs', 'file://' + process.cwd() + '/'))
  result.fahrenheit = [[212, 100], [32, 0], [50, 10], [-40, -40]].every(([f, c]) => Math.abs(toCelsius(f, 'F') - c) < 1e-9) && toCelsius(12.5, 'C') === 12.5
} catch { result.fahrenheit = false }
try {
  const out = daily('--from', '2026-10-01', '--to', '2026-10-03')
  const lines = out.stdout.trim().split('\\n')
  result.noData = out.status === 0 && lines.length === 3 && /^2026-10-02\\b.*no data/.test(lines[1]) && !/NaN|Infinity/.test(out.stdout) && /^2026-10-03\\b.*\\d/.test(lines[2])
} catch { result.noData = false }
try {
  const one = daily('--from', '2026-10-03', '--to', '2026-10-03', '--station', 'north')
  const airport = daily('--from', '2026-10-01', '--to', '2026-10-01', '--station', 'airport')
  result.station = one.status === 0 && /min 8\\.5\\b/.test(one.stdout) && /max 14\\.0\\b/.test(one.stdout) && /mean 11\\.2\\b/.test(one.stdout) &&
    /min 8\\.0\\b/.test(airport.stdout) && /max 14\\.5\\b/.test(airport.stdout) && /mean 11\\.3\\b/.test(airport.stdout)
} catch { result.station = false }
try {
  const readme = readFileSync('README.md', 'utf8')
  result.readme = /npm run daily/.test(readme) && !/npm run summary/.test(readme)
} catch { result.readme = false }
process.stdout.write(JSON.stringify(result))
`
writeFileSync(join(scratch, 'probe.mjs'), PROBE)

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const prefix = relative(root, dir)
function probeAt(sha) {
  const work = mkdtempSync(join(scratch, 'at-'))
  execFileSync('sh', ['-c', `git -C "${root}" archive ${sha} "${prefix}" | tar -x -C "${work}"`])
  return JSON.parse(
    execFileSync(process.execPath, [join(scratch, 'probe.mjs')], {
      cwd: join(work, prefix),
      encoding: 'utf8',
    }),
  )
}
const NONE = { fahrenheit: false, noData: false, station: false, readme: false }
const ALL = { fahrenheit: true, noData: true, station: true, readme: true }
try {
  const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
    .split('\n')
    .at(-1)
  assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
  assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the feature branch')
  assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
  const commits = git('rev-list', '--reverse', `${baseline}..HEAD`).split('\n').filter(Boolean)
  let previous = probeAt(baseline)
  assert.deepEqual(previous, NONE, 'starting state')
  for (const sha of commits) {
    const now = probeAt(sha)
    const delivered = Object.keys(now).filter((item) => now[item] && !previous[item])
    assert.ok(
      delivered.length <= 1,
      `commit ${sha.slice(0, 8)} delivers more than one item: ${delivered.join(', ')}`,
    )
    previous = now
  }
  assert.deepEqual(previous, ALL, 'every item is done')
  execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
