// Development check for nav keyboard focus: a visible focus-visible style wins; hover is unchanged.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const css = readFileSync(join(process.argv[2], 'nav.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body], index) => ({
  selectors: selector.split(',').map((part) => part.trim()),
  body,
  index,
}))
const visible = rules.filter(
  (rule) =>
    rule.selectors.some((selector) => /\.nav a:focus-visible/.test(selector)) &&
    /(outline|box-shadow)\s*:\s*(?!none)[^;]+/.test(rule.body),
)
assert.ok(visible.length, 'a visible :focus-visible style exists for nav links')
const last = Math.max(...visible.map((rule) => rule.index))
const hides = rules.filter(
  (rule) =>
    rule.index > last &&
    rule.selectors.some((selector) => /\.nav a:focus(-visible)?$/.test(selector)) &&
    /outline\s*:\s*none/.test(rule.body),
)
assert.equal(hides.length, 0, 'no later rule hides the focus style')
const hover = rules.find((rule) => rule.selectors.includes('.nav a:hover'))
assert.ok(
  hover && /color:\s*var\(--accent\)/.test(hover.body) && /underline/.test(hover.body),
  'hover unchanged',
)
