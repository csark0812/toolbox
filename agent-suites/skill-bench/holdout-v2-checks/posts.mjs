// Hidden acceptance for the slug feature: only unambiguous cases from the request are pinned
// (folding, separators, the 50-character word-boundary cut, numeric suffixes, createPost wiring).
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { slugify } = await import(pathToFileURL(join(dir, 'src/slug.mjs')).href)
const { createPost, createStore } = await import(pathToFileURL(join(dir, 'src/posts.mjs')).href)
assert.equal(slugify('Hello, World!'), 'hello-world')
assert.equal(slugify('Crème Brûlée à la Carte'), 'creme-brulee-a-la-carte')
assert.equal(slugify('  --Rock & Roll--  '), 'rock-roll')
assert.equal(slugify('Top 10 Tips for 2026'), 'top-10-tips-for-2026')
assert.equal(slugify('Ünïcödé   Spaces\tand_underscores'), 'unicode-spaces-and-underscores')
const long = 'Twelve practical ways to make your morning coffee taste much better today'
const full = 'twelve-practical-ways-to-make-your-morning-coffee-taste-much-better-today'
const cut = slugify(long)
assert.ok(cut.length <= 50, `at most 50 characters: ${cut}`)
assert.ok(full.startsWith(cut) && full[cut.length] === '-', `cut at a word boundary: ${cut}`)
assert.equal(cut, 'twelve-practical-ways-to-make-your-morning-coffee')
assert.equal(slugify('Hello World', new Set(['hello-world'])), 'hello-world-2')
assert.equal(slugify('Hello World', new Set(['hello-world', 'hello-world-2'])), 'hello-world-3')
assert.equal(slugify('Hello World', new Set(['hello-world-2'])), 'hello-world')
const store = createStore()
assert.equal(createPost(store, { title: 'Launch Day!' }).slug, 'launch-day')
assert.equal(createPost(store, { title: 'Launch day' }).slug, 'launch-day-2')
assert.equal(createPost(store, { title: 'Other' }).slug, 'other')
const ownTests = readdirSync(join(dir, 'tests'))
  .filter((name) => name.endsWith('.mjs'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .filter((text) => /slugify/.test(text))
assert.ok(ownTests.length > 0, 'the feature ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
