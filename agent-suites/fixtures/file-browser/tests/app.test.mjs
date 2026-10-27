import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../app.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})
