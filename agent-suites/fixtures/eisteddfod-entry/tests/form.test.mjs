import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('every string has both languages and every key in the markup exists', () => {
  const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8')
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const [en, cy] = app.split(/^ {2}cy: \{$/m)
  const keys = (text) => [...text.matchAll(/^ {4}(\w+):/gm)].map((m) => m[1])
  assert.deepEqual(keys(cy), keys(en.split(/^ {2}en: \{$/m)[1]))
  for (const [, key] of html.matchAll(/data-i18n="(\w+)"/g)) assert.ok(keys(cy).includes(key), key)
})
