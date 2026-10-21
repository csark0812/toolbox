import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('every show class is listed with its number', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const classes = html.match(/class="show-class"/g) ?? []
  assert.equal(classes.length, 9)
  for (let n = 1; n <= 9; n += 1) assert.match(html, new RegExp(`Class ${n}<`))
})
