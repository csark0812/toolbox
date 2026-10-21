import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('stylesheet has balanced braces', () => {
  const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')
  assert.equal(css.split('{').length, css.split('}').length)
})

test('every attendee has a badge with a role', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const badges = html.match(/<article class="badge badge--(speaker|staff|sponsor|attendee)"/g) ?? []
  const roles = html.match(/class="badge__role"/g) ?? []
  assert.equal(badges.length, 23)
  assert.equal(roles.length, badges.length)
})
