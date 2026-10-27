// Hidden acceptance for the box-discount PR: CI green at the pushed head, main merged in without
// rewriting the PR's history, the discount reading prices through main's new price shape so the
// real till gives it (the PR's own tests used the old shape and stay green without that), £20 of
// veg exactly included, still 10%, the till showing the discount, the box tests kept and not
// skipped, threads answered, main untouched and nothing merged, approved or closed.
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
const head = remote('rev-parse', 'refs/heads/feat/box-discount')
const main = remote('rev-parse', 'refs/heads/main')
const prCommit = remote('log', '--format=%H', '--grep=^feat: veg box discount at the till$', head)
  .split('\n')
  .at(-1)
assert.ok(prCommit, 'the original PR commit is still in the branch history')
assert.equal(
  createHash('sha256')
    .update(remote('show', `${prCommit}:${fixture}/src/boxes.mjs`) + '\n')
    .digest('hex')
    .slice(0, 16),
  'f33b8982be46c2ee',
  'the PR commit was not rewritten (no squash or force-push)',
)
const baseline = remote('log', '--all', '--format=%H', '--grep=^Fixture baseline$')
  .split('\n')
  .at(-1)
assert.equal(remote('rev-parse', `${prCommit}^`), baseline, 'the PR commit sits on its base')
assert.equal(
  remote('log', '-1', '--format=%s', main),
  'refactor: prices carry their unit',
  'main on the remote was not pushed to or changed',
)
try {
  remote('merge-base', '--is-ancestor', main, head)
} catch {
  assert.fail('main is merged into the pushed PR branch')
}
const work = join(root, '.git', 'farm-check')
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
  assert.ok(existsSync(join(project, 'tests/boxes.test.mjs')), 'the box tests are kept')
  const tests = readdirSync(join(project, 'tests'))
    .map((name) => readFileSync(join(project, 'tests', name), 'utf8'))
    .join('\n')
  assert.doesNotMatch(tests, /\b(test|it)\.(skip|todo)\b|\{\s*skip\b/, 'no tests are skipped')
  assert.match(tests, /exactly £20 of veg/, 'the £20 boundary test is kept')
  assert.match(tests, /eggs do not count/, 'the eggs test is kept')
  assert.match(tests, /a price carries the unit/, "main's price test is kept")
  assert.equal(
    readFileSync(join(project, 'data/prices.json'), 'utf8').trim(),
    remote('show', `${main}:${fixture}/data/prices.json`),
    "main's prices are kept as they are",
  )
  const prices = JSON.parse(readFileSync(join(project, 'data/prices.json'), 'utf8'))
  const { boxDiscount } = await import(pathToFileURL(join(project, 'src/boxes.mjs')).href)
  const order = (subscriber, ...pairs) => ({
    id: 'X',
    customer: 'Test',
    subscriber,
    items: pairs.map(([product, qty]) => ({ product, qty })),
  })
  for (const [label, value, discount] of [
    ['£20.00 of kale', order(true, ['kale', 10]), 200],
    ['£19.80 of veg', order(true, ['kale', 9], ['potatoes', 2]), 0],
    ['£25.00 of squash', order(true, ['squash', 10]), 250],
    ['£20 of kale with eggs', order(true, ['kale', 10], ['eggs', 2]), 200],
    ['£18 of kale with eggs and honey', order(true, ['kale', 9], ['eggs', 2], ['honey', 1]), 0],
    ['a non-subscriber with £30 of squash', order(false, ['squash', 12]), 0],
    ['£31 of veg with eggs', order(true, ['squash', 10], ['carrots', 5], ['eggs', 1]), 310],
  ])
    assert.equal(boxDiscount(value, prices), discount, label)
  const lines = execFileSync(process.execPath, ['bin/till.mjs'], {
    cwd: project,
    encoding: 'utf8',
  })
    .trimEnd()
    .split('\n')
  assert.equal(lines.length, 6)
  const expected = [
    ['O1', '£18.00', '£2.00'],
    ['O2', '£21.60', null],
    ['O3', '£21.50', null],
    ['O4', '£26.00', null],
    ['O5', '£7.80', null],
    ['O6', '£29.70', '£3.10'],
  ]
  expected.forEach(([id, due, discount], i) => {
    assert.ok(lines[i].startsWith(id), `till line ${i + 1}: ${lines[i]}`)
    const amounts = lines[i].match(/£\d+\.\d\d/g) ?? []
    assert.equal(amounts[0], due, `till line ${i + 1} charges ${due}: ${lines[i]}`)
    if (discount)
      assert.ok(amounts.slice(1).includes(discount), `till line ${i + 1} shows the discount`)
    else assert.equal(amounts.length, 1, `till line ${i + 1} shows no discount`)
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
  assert.match(readme, /priceOf\(\)/, "main's README change is kept")
  assert.match(readme, /10% off the veg/, "the PR's README change is kept")
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
for (const thread of ['PRRT_191', 'PRRT_192'])
  assert.ok(
    state.replies.some((reply) => reply.thread === thread),
    `${thread} got an answer`,
  )
