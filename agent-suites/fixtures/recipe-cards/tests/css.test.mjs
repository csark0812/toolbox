import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('the page lists eight recipes and two more from Ada', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const [main, aside] = html.split('<aside')
  assert.equal((main.match(/<article class="card">/g) ?? []).length, 8)
  assert.equal((aside.match(/<article class="card">/g) ?? []).length, 2)
})
