import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')

test('stylesheet has balanced braces', () => {
  assert.equal(css.split('{').length, css.split('}').length)
})

test('colours come from the tokens', () => {
  const rules = css.slice(css.indexOf('}') + 1)
  assert.doesNotMatch(rules, /#[0-9a-f]{3,6}\b/i)
})
