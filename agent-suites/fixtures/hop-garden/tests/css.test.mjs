import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('the rota lists twelve shifts on each day', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  for (const day of html.split('<section class="day"').slice(1))
    assert.equal((day.match(/<tr[ >]/g) ?? []).length, 13)
})
