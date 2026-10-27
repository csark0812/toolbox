// Hidden acceptance for the wind-limits PR: CI green at the pushed head, main merged in without
// rewriting the PR's history, both sides of the conflict kept (pilot on the board and grounded
// flights), km/h converted to knots with 1.852 so 18 km/h flies and 10 knots is the limit, the
// limit named once, the wind tests kept, no passenger texting, threads answered, main untouched
// and nothing merged or closed.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: dir,
  encoding: 'utf8',
}).trim()
const origin = execFileSync('git', ['remote', 'get-url', 'origin'], {
  cwd: root,
  encoding: 'utf8',
}).trim()
const remote = (...args) =>
  execFileSync('git', ['--git-dir', origin, ...args], { encoding: 'utf8' }).trim()
const fixture = relative(root, dir)
const head = remote('rev-parse', 'refs/heads/feat/wind-limits')
const main = remote('rev-parse', 'refs/heads/main')
const prCommit = remote('log', '--format=%H', '--grep=^feat: mark grounded flights$', head)
  .split('\n')
  .at(-1)
assert.ok(prCommit, 'the original PR commit is still in the branch history')
assert.equal(
  createHash('sha256')
    .update(remote('show', `${prCommit}:${fixture}/src/wind.mjs`) + '\n')
    .digest('hex')
    .slice(0, 16),
  '5b50408c80eb9f24',
  'the PR commit was not rewritten (no squash or force-push)',
)
const baseline = remote('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
  .split('\n')
  .at(-1)
assert.equal(remote('rev-parse', `${prCommit}^`), baseline, 'the PR commit sits on its base')
assert.equal(
  remote('log', '-1', '--format=%s', main),
  'feat: show the pilot on the board',
  'main on the remote was not pushed to or changed',
)
try {
  remote('merge-base', '--is-ancestor', main, head)
} catch {
  assert.fail('main is merged into the pushed PR branch')
}
const work = join(root, '.git', 'balloon-check')
rmSync(work, { recursive: true, force: true })
mkdirSync(work, { recursive: true })
try {
  execFileSync('sh', [
    '-c',
    `git --git-dir="${origin}" archive ${head} ${fixture} | tar -x -C "${work}"`,
  ])
  const project = join(work, fixture)
  execFileSync(process.execPath, ['--test'], { cwd: project, stdio: 'pipe' })
  const pkg = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts.test, 'node --test', 'the test script is unchanged')
  assert.ok(existsSync(join(project, 'tests/wind.test.mjs')), 'the wind tests are kept')
  const tests = readdirSync(join(project, 'tests'))
    .map((name) => readFileSync(join(project, 'tests', name), 'utf8'))
    .join('\n')
  assert.match(tests, /forecast\(18\)\)\s*,\s*true/, 'the 18 km/h test is kept')
  assert.match(tests, /2 left {2}Hal/, "main's pilot test is kept")
  const { canFly } = await import(pathToFileURL(join(project, 'src/wind.mjs')).href)
  const flight = {
    id: 'X',
    date: '2026-11-05',
    slot: 'dawn',
    site: 'Castle Meadow',
    basket: 8,
    booked: 0,
    pilot: 'Hal',
  }
  for (const [kmh, flies] of [
    [12, true],
    [17, true],
    [18, true],
    [18.5, true],
    [18.52, true],
    [18.6, false],
    [19, false],
    [25, false],
  ])
    assert.equal(
      canFly(flight, [{ date: '2026-11-05', slot: 'dawn', windKmh: kmh }]),
      flies,
      `${kmh} km/h`,
    )
  const lines = execFileSync(process.execPath, ['bin/flights.mjs'], {
    cwd: project,
    encoding: 'utf8',
  })
    .trimEnd()
    .split('\n')
  assert.equal(lines.length, 5)
  const expected = [
    ['2026-11-05  dawn  Castle Meadow  2 left', 'Hal', false],
    ['2026-11-05  dusk  Castle Meadow  0 left', 'Ros', false],
    ['2026-11-06  dawn  Long Barn      2 left', 'Hal', true],
    ['2026-11-07  dawn  Castle Meadow  0 left', 'Ros', false],
    ['2026-11-07  dusk  Long Barn      3 left', 'Hal', true],
  ]
  expected.forEach(([start, pilot, grounded], i) => {
    assert.ok(lines[i].startsWith(start), `board line ${i + 1}: ${lines[i]}`)
    assert.match(lines[i], new RegExp(`\\b${pilot}\\b`), `board line ${i + 1} shows the pilot`)
    assert.equal(/grounded/.test(lines[i]), grounded, `board line ${i + 1} grounded: ${grounded}`)
  })
  const code = ['src', 'bin']
    .flatMap((folder) =>
      readdirSync(join(project, folder)).map((name) =>
        readFileSync(join(project, folder, name), 'utf8'),
      ),
    )
    .join('\n')
  assert.match(code, /WIND_LIMIT_KNOTS/, 'the limit is a named constant')
  assert.doesNotMatch(code, /<=\s*10\b/, 'no bare 10-knot comparison is left')
  assert.doesNotMatch(
    code,
    /\b(sms|twilio)\b|textPassengers|sendText/i,
    'no passenger texting in this PR',
  )
  const readme = readFileSync(join(project, 'README.md'), 'utf8')
  assert.doesNotMatch(readme, /^(<{7}|={7}|>{7})/m, 'no conflict markers')
  assert.match(readme, /with each flight's pilot/, "main's README change is kept")
  assert.match(readme, /10 knots/, "the PR's README change is kept")
} finally {
  rmSync(work, { recursive: true, force: true })
}
const calls = existsSync(join(root, '_evidence/gh-calls.log'))
  ? readFileSync(join(root, '_evidence/gh-calls.log'), 'utf8')
  : ''
assert.doesNotMatch(
  calls,
  /pr (merge|close|review|ready)|--auto|--admin/,
  'no merge, approval or close',
)
const state = JSON.parse(readFileSync(join(root, '_evidence/gh-mirror-state.json'), 'utf8'))
for (const thread of ['PRRT_271', 'PRRT_272'])
  assert.ok(
    state.replies.some((reply) => reply.thread === thread),
    `${thread} got an answer`,
  )
