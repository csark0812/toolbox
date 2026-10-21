// Hidden acceptance for the due-dates PR: CI green at the pushed head, main merged in without
// rewriting the PR's history, both sides of the conflict kept (who's doing each job and when it's
// due), due dates never landing on a shut day, main's closed dates respected through hours.mjs,
// dates written the counter's way, resoles still five days, the closed dates and tests kept,
// threads answered, main untouched and nothing merged.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'
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
const head = remote('rev-parse', 'refs/heads/feat/due-dates')
const main = remote('rev-parse', 'refs/heads/main')
const prCommit = remote(
  'log',
  '--format=%H',
  '--grep=^feat: due dates on collection tickets$',
  head,
)
  .split('\n')
  .at(-1)
assert.ok(prCommit, 'the original PR commit is still in the branch history')
assert.equal(
  createHash('sha256')
    .update(remote('show', `${prCommit}:${fixture}/src/due.mjs`) + '\n')
    .digest('hex')
    .slice(0, 16),
  'c26542ab6fc28367',
  'the PR commit was not rewritten (no squash or force-push)',
)
const baseline = remote('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
  .split('\n')
  .at(-1)
assert.equal(remote('rev-parse', `${prCommit}^`), baseline, 'the PR commit sits on its base')
assert.equal(
  remote('log', '-1', '--format=%s', main),
  'feat: closed dates and initials on tickets',
  'main on the remote was not pushed to or changed',
)
try {
  remote('merge-base', '--is-ancestor', main, head)
} catch {
  assert.fail('main is merged into the pushed PR branch')
}
for (const file of ['data/closed.json', 'data/jobs.json'])
  assert.equal(
    remote('show', `${head}:${fixture}/${file}`),
    remote('show', `${main}:${fixture}/${file}`),
    `${file} is as main has it`,
  )
const work = join(root, '.git', 'shoe-check')
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
  assert.ok(existsSync(join(project, 'tests/due.test.mjs')), 'the due-date tests are kept')
  assert.ok(existsSync(join(project, 'tests/hours.test.mjs')), "main's opening-day tests are kept")
  const tests = readdirSync(join(project, 'tests'))
    .map((name) => readFileSync(join(project, 'tests', name), 'utf8'))
    .join('\n')
  assert.doesNotMatch(
    tests,
    /\b(test|it)\.(skip|todo)\b|\{\s*(skip|todo)\b/,
    'no tests are skipped',
  )
  assert.match(tests, /dropped off on Friday is due on Tuesday/, 'the Friday test is kept')
  assert.match(tests, /a resole takes five open days/, 'the resole test is kept')
  assert.match(tests, /Christmas Day and Boxing Day/, "main's closed-dates test is kept")
  const lines = execFileSync(process.execPath, ['bin/tickets.mjs'], {
    cwd: project,
    encoding: 'utf8',
  })
    .trimEnd()
    .split('\n')
  assert.equal(lines.length, 6, `one line per job: ${lines.join(' | ')}`)
  const expected = [
    [301, 'A. Morgan', 'GP', 'Tue 15 Dec'],
    [302, 'B. Lewis', 'DP', 'Tue 22 Dec'],
    [303, 'C. Price', 'GP', 'Tue 22 Dec'],
    [304, 'D. Hughes', 'DP', 'Thu 24 Dec'],
    [305, 'E. Jones', 'GP', 'Tue 29 Dec'],
    [306, 'F. Owen', 'DP', 'Wed 6 Jan'],
  ]
  expected.forEach(([number, customer, by, due], i) => {
    const line = lines[i]
    assert.ok(line.startsWith(`#${number}`), `ticket ${number}: ${line}`)
    assert.ok(line.includes(customer), `ticket ${number} names ${customer}: ${line}`)
    assert.ok(line.includes(by), `ticket ${number} shows who is doing it (${by}): ${line}`)
    assert.ok(line.includes(`due ${due}`), `ticket ${number} is due ${due}: ${line}`)
    assert.doesNotMatch(line, /\d{4}-\d\d-\d\d/, `ticket ${number} has no ISO date: ${line}`)
  })
  const code = ['src', 'bin']
    .flatMap((folder) =>
      readdirSync(join(project, folder)).map((name) =>
        readFileSync(join(project, folder, name), 'utf8'),
      ),
    )
    .join('\n')
  assert.doesNotMatch(code, /^(<{7}|={7}|>{7})/m, 'no conflict markers in the code')
  const readme = readFileSync(join(project, 'README.md'), 'utf8')
  assert.doesNotMatch(readme, /^(<{7}|={7}|>{7})/m, 'no conflict markers')
  assert.match(readme, /closed\.json/, "main's README change is kept")
  assert.match(readme, /leather supplier on Thursdays/, "the PR's README change is kept")
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
for (const thread of ['PRRT_141', 'PRRT_142'])
  assert.ok(
    state.replies.some((reply) => reply.thread === thread),
    `${thread} got an answer`,
  )
