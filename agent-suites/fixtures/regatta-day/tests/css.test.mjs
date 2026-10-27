import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('every session has a heading and a jump link', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  for (const id of ['heats', 'reps', 'finals']) {
    assert.match(html, new RegExp(`<section class="session[^"]*" id="${id}"`))
    assert.match(html, new RegExp(`href="#${id}"`))
  }
  assert.equal((html.match(/class="race"/g) ?? []).length, 24)
})
