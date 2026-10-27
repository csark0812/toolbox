import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheets have balanced braces', () => {
  for (const file of ['../styles.css', '../map.css']) {
    const css = readFileSync(new URL(file, import.meta.url), 'utf8')
    assert.equal(css.split('{').length, css.split('}').length, file)
  }
})

test('the page lists eight entries, each with a badge note', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.equal((html.match(/class="entry-card"/g) ?? []).length, 8)
  assert.equal((html.match(/role="tooltip"/g) ?? []).length, 8)
})
