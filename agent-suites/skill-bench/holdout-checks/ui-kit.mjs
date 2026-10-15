// Hidden acceptance for CSS parity: .btn-secondary (and its hover) render like .button--alt; primary untouched.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const HEX = { '#fff': '#ffffff' }
function rules(css) {
  const map = new Map()
  for (const [, selector, body] of css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const decls = {}
    for (const part of body.split(';')) {
      const [prop, ...rest] = part.split(':')
      if (!prop.trim() || !rest.length) continue
      const value = rest.join(':').trim().toLowerCase().replace(/\s+/g, ' ')
      decls[prop.trim().toLowerCase()] = HEX[value] ?? value
    }
    for (const name of selector.split(','))
      map.set(name.trim(), { ...(map.get(name.trim()) ?? {}), ...decls })
  }
  return map
}
const legacy = rules(readFileSync(join(dir, 'legacy.css'), 'utf8'))
const next = rules(readFileSync(join(dir, 'new.css'), 'utf8'))
assert.deepEqual(
  next.get('.btn-secondary'),
  legacy.get('.button--alt'),
  '.btn-secondary must match .button--alt',
)
assert.deepEqual(
  next.get('.btn-secondary:hover'),
  legacy.get('.button--alt:hover'),
  'hover must match',
)
assert.equal(next.get('.btn-primary')?.background, '#2f6fed', '.btn-primary is unchanged')
assert.equal(next.get('.btn-primary')?.['font-weight'], '600')
