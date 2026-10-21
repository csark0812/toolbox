import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('the slot grid lists eight slots, two of them full', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.equal((html.match(/class="slot"/g) ?? []).length, 8)
  assert.equal((html.match(/class="slot" type="button" disabled/g) ?? []).length, 2)
})
