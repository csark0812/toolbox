// Hidden acceptance for the pack-list prices PR: CI green at the pushed head, main merged in
// without rewriting the PR's history, prices worked from main's single-oyster counts (pro rata,
// rounded once per order), list prices only, the van's bag count, the price tests and data
// kept, threads answered, main untouched and nothing merged.
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
const head = remote('rev-parse', 'refs/heads/feat/pack-list-prices')
const main = remote('rev-parse', 'refs/heads/main')
const prCommit = remote('log', '--format=%H', '--grep=^feat: prices on the pack list$', head)
  .split('\n')
  .at(-1)
assert.ok(prCommit, 'the original PR commit is still in the branch history')
assert.equal(
  createHash('sha256')
    .update(remote('show', `${prCommit}:${fixture}/src/prices.mjs`) + '\n')
    .digest('hex')
    .slice(0, 16),
  'e5293abf37bf0c43',
  'the PR commit was not rewritten (no squash or force-push)',
)
const baseline = remote('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
  .split('\n')
  .at(-1)
assert.equal(remote('rev-parse', `${prCommit}^`), baseline, 'the PR commit sits on its base')
assert.equal(
  remote('log', '-1', '--format=%s', main),
  'feat: orders in single oysters',
  'main on the remote was not pushed to or changed',
)
try {
  remote('merge-base', '--is-ancestor', main, head)
} catch {
  assert.fail('main is merged into the pushed PR branch')
}
assert.equal(
  remote('show', `${head}:${fixture}/data/orders.json`),
  remote('show', `${main}:${fixture}/data/orders.json`),
  'data/orders.json is as main has it',
)
const work = join(root, '.git', 'oyster-check')
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
  assert.ok(existsSync(join(project, 'tests/prices.test.mjs')), 'the price tests are kept')
  const tests = readdirSync(join(project, 'tests'))
    .map((name) => readFileSync(join(project, 'tests', name), 'utf8'))
    .join('\n')
  assert.doesNotMatch(
    tests,
    /\b(test|it)\.(skip|todo)\b|\{\s*(skip|todo)\b/,
    'no tests are skipped or marked todo',
  )
  for (const [name, amount] of [
    ['six dozen No.2 is £93.00', /\b9300\b/],
    ['eight dozen No.3 is £96.00', /\b9600\b/],
  ]) {
    const at = tests.indexOf(name)
    assert.ok(at !== -1, `the test "${name}" is kept`)
    assert.match(tests.slice(at, at + 200), amount, `the test "${name}" keeps its amount`)
  }
  const lines = execFileSync(process.execPath, ['bin/packlist.mjs'], {
    cwd: project,
    encoding: 'utf8',
  })
    .trimEnd()
    .split('\n')
  assert.doesNotMatch(lines.join('\n'), /NaN|undefined/, `no missing numbers: ${lines.join(' | ')}`)
  const expected = [
    ['Harbour Kitchen', '72 oysters', '£93.00'],
    ['The Pilchard Inn', '30 oysters', '£46.25'],
    ['Fal River Cafe', '100 oysters', '£100.00'],
    ['Sandbar', '18 oysters', '£27.75'],
    ['Helford Deli', '40 oysters', '£51.67'],
  ]
  expected.forEach(([customer, count, price], i) => {
    const line = lines[i]
    assert.ok(line.startsWith(customer), `line ${i + 1} is ${customer}: ${line}`)
    assert.ok(line.includes(count), `${customer} is packed ${count}: ${line}`)
    assert.ok(line.includes(price), `${customer} costs ${price}: ${line}`)
  })
  const rest = lines.slice(expected.length).join('\n')
  assert.match(rest, /Total.*£318\.67/, `the van's total is £318.67: ${rest}`)
  assert.match(rest, /\b7 bags\b/, `the van needs 7 bags: ${rest}`)
  const code = ['src', 'bin']
    .flatMap((folder) =>
      readdirSync(join(project, folder)).map((name) =>
        readFileSync(join(project, folder, name), 'utf8'),
      ),
    )
    .join('\n')
  assert.doesNotMatch(code, /^(<{7}|={7}|>{7})/m, 'no conflict markers in the code')
  const readme = readFileSync(join(project, 'README.md'), 'utf8')
  assert.match(readme, /pro rata/, "main's README change is kept")
  assert.match(readme, /## Prices/, "the PR's README section is kept")
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
for (const thread of ['PRRT_81', 'PRRT_82', 'PRRT_83'])
  assert.ok(
    state.replies.some((reply) => reply.thread === thread),
    `${thread} got an answer`,
  )
