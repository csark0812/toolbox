// Hidden acceptance for the TODO batch: all three fixed, each in its own commit, tests green.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
const { paginate } = await load('paginate.mjs')
const { WELCOME } = await load('messages.mjs')
const { createNote } = await load('notes.mjs')
const items = Array.from({ length: 7 }, (_, i) => i + 1)
assert.deepEqual(paginate(items, 1, 3), [1, 2, 3])
assert.deepEqual(paginate(items, 2, 3), [4, 5, 6])
assert.deepEqual(paginate(items, 3, 3), [7])
assert.match(WELCOME, /^Welcome back!/)
assert.deepEqual(createNote({ title: 't' }).tags, [])
assert.deepEqual(createNote({ title: 't', tags: ['a'] }).tags, ['a'])
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: dir,
  encoding: 'utf8',
}).trim()
const baseline = execFileSync('git', ['log', '--format=%H', '--grep=^Fixture baseline$'], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .at(-1)
const prefix = relative(root, join(dir, 'src'))
const commits = execFileSync('git', ['log', '--format=%H', `${baseline}..HEAD`], {
  cwd: root,
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean)
const touched = commits.map((sha) =>
  execFileSync('git', ['show', '--name-only', '--format=', sha], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter((file) => file.startsWith(prefix) && /(paginate|messages|notes)\.mjs$/.test(file)),
)
for (const file of ['paginate.mjs', 'messages.mjs', 'notes.mjs'])
  assert.ok(
    touched.some((files) => files.some((f) => f.endsWith(file))),
    `${file} fix is committed`,
  )
assert.ok(
  touched.every((files) => files.length <= 1),
  'each commit fixes one TODO item',
)
