import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

for (const name of ['theme.css', 'panel.css'])
  test(`${name} has balanced braces`, () => {
    const css = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8')
    assert.equal(css.split('{').length, css.split('}').length)
  })
