import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const dir = new URL('../styles/', import.meta.url)

test('every stylesheet has balanced braces', () => {
  for (const name of readdirSync(dir)) {
    const css = readFileSync(new URL(name, dir), 'utf8')
    assert.equal(css.split('{').length, css.split('}').length, name)
  }
})
