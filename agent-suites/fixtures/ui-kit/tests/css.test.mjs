import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
test('stylesheets have balanced braces', () => {
  for (const file of ['legacy.css', 'new.css']) {
    const css = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
    assert.equal(css.split('{').length, css.split('}').length, file)
  }
})
