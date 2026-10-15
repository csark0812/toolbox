// Hidden acceptance for the recipes TODO batch: all three items done, each in its own commit.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { scale } = await import(pathToFileURL(join(dir, 'src/scale.mjs')).href)
const recipes = JSON.parse(readFileSync(join(dir, 'data/recipes.json'), 'utf8'))
const pancakes = recipes.find((r) => r.id === 'pancakes')
const qty = (recipe, name) => recipe.ingredients.find((i) => i.name === name).qty
const forTwo = scale(pancakes, 2)
assert.equal(qty(forTwo, 'salt'), 0.25)
assert.equal(qty(forTwo, 'baking powder'), 0.75)
assert.equal(qty(forTwo, 'flour'), 125)
const pannaCotta = recipes.find((r) => r.id === 'panna-cotta')
assert.equal(qty(scale(pannaCotta, 1), 'sugar'), 13.33, 'two decimals')
assert.equal(qty(scale(pancakes, 8), 'flour'), 500)
assert.equal(recipes.find((r) => r.id === 'shakshuka').category, 'breakfast')
assert.equal(recipes.find((r) => r.id === 'panna-cotta').category, 'dessert')
const list = (...args) =>
  execFileSync(process.execPath, ['bin/list.mjs', ...args], { cwd: dir, encoding: 'utf8' })
assert.deepEqual(
  JSON.parse(list('--json')),
  recipes.map(({ id, title, minutes }) => ({ id, title, minutes })),
)
assert.match(list(), /^pancakes\s+Buttermilk pancakes\s+25 min/m, 'the table is still the default')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const root = git('rev-parse', '--show-toplevel')
const baseline = git('log', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
const prefix = relative(root, dir)
const groups = {
  scale: /^src\/scale\.mjs$/,
  json: /^(bin\/list\.mjs|src\/format\.mjs)$/,
  data: /^data\/recipes\.json$/,
}
const commits = git('log', '--format=%H', `${baseline}..HEAD`).split('\n').filter(Boolean)
const touched = commits.map((sha) => {
  const files = git('show', '--name-only', '--format=', sha)
    .split('\n')
    .filter((file) => file.startsWith(`${prefix}/`))
    .map((file) => file.slice(prefix.length + 1))
  return Object.keys(groups).filter((group) => files.some((file) => groups[group].test(file)))
})
for (const group of Object.keys(groups))
  assert.ok(
    touched.some((list) => list.includes(group)),
    `the ${group} item is committed`,
  )
assert.ok(
  touched.every((list) => list.length <= 1),
  'each commit covers one TODO item',
)
assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
