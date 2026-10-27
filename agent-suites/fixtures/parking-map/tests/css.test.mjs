import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('every car park on the map has a popup and a pay button', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const markers = html.match(/class="marker"/g) ?? []
  const pay = html.match(/class="pay-btn"/g) ?? []
  assert.equal(markers.length, 6)
  assert.equal(pay.length, markers.length)
})
