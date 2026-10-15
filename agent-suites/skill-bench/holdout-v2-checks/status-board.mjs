// Hidden acceptance for the dark-mode readability fix: badge text and disabled-button text are
// readable in dark mode, and every light-mode color (and the other dark-mode colors) is unchanged.
// A small cascade resolver: source order per selector, :root custom properties, var() fallbacks,
// prefers-color-scheme media blocks, light-dark(), hex, rgb() and a few named colors.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const dir = process.argv[2]
const css = readFileSync(join(dir, 'styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function parse(text, media = null, out = []) {
  let i = 0
  while (i < text.length) {
    const open = text.indexOf('{', i)
    if (open === -1) break
    const head = text.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (depth && j < text.length) {
      if (text[j] === '{') depth++
      else if (text[j] === '}') depth--
      j++
    }
    const body = text.slice(open + 1, j - 1)
    if (head.startsWith('@media')) parse(body, `${media ?? ''} ${head}`, out)
    else if (!head.startsWith('@')) {
      const decls = []
      for (const part of body.split(';')) {
        const colon = part.indexOf(':')
        if (colon === -1) continue
        decls.push([part.slice(0, colon).trim().toLowerCase(), part.slice(colon + 1).trim()])
      }
      out.push({ media, selectors: head.split(',').map((s) => s.trim()), decls })
    }
    i = j
  }
  return out
}
const rules = parse(css)
const applies = (rule, mode) =>
  rule.media === null ||
  (/prefers-color-scheme:\s*dark/.test(rule.media) && mode === 'dark') ||
  (/prefers-color-scheme:\s*light/.test(rule.media) && mode === 'light')

function declarations(selector, mode) {
  const found = {}
  for (const rule of rules)
    if (applies(rule, mode) && rule.selectors.includes(selector))
      for (const [prop, value] of rule.decls) {
        const important = /!important$/.test(value)
        if (found[prop]?.important && !important) continue
        found[prop] = { value: value.replace(/\s*!important$/, ''), important }
        if (prop === 'background-color' || prop === 'background') found.bg = found[prop]
      }
  return Object.fromEntries(Object.entries(found).map(([k, v]) => [k, v.value]))
}

function resolve(value, mode, tokens, seen = new Set()) {
  return value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g,
    (_, name, fallback) => {
      if (seen.has(name)) throw new Error(`cycle in ${name}`)
      if (tokens[name] !== undefined)
        return resolve(tokens[name], mode, tokens, new Set([...seen, name]))
      if (fallback !== undefined) return resolve(fallback, mode, tokens, seen)
      throw new Error(`undefined custom property ${name}`)
    },
  )
}

const NAMED = { white: '#ffffff', black: '#000000', transparent: '#0000' }
function color(raw, mode) {
  let value = raw.trim().toLowerCase()
  const ld = value.match(/^light-dark\((.*)\)$/)
  if (ld) {
    let depth = 0
    let split = -1
    for (let k = 0; k < ld[1].length; k++) {
      if (ld[1][k] === '(') depth++
      else if (ld[1][k] === ')') depth--
      else if (ld[1][k] === ',' && depth === 0) split = k
    }
    value = mode === 'light' ? ld[1].slice(0, split) : ld[1].slice(split + 1)
    return color(value, mode)
  }
  value = NAMED[value] ?? value
  let hex = value.match(/^#([0-9a-f]{3,8})$/)?.[1]
  if (hex) {
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('')
    const n = (k) => parseInt(hex.slice(k, k + 2), 16)
    return [n(0), n(2), n(4), hex.length === 8 ? n(6) / 255 : 1]
  }
  const rgb = value.match(/^rgba?\(([^)]*)\)$/)
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean)
    const channel = (p) => (p.endsWith('%') ? (parseFloat(p) * 255) / 100 : parseFloat(p))
    const alpha =
      parts[3] === undefined
        ? 1
        : parts[3].endsWith('%')
          ? parseFloat(parts[3]) / 100
          : parseFloat(parts[3])
    return [channel(parts[0]), channel(parts[1]), channel(parts[2]), alpha]
  }
  // The background shorthand may carry a single color token.
  const word = value.split(/\s+/).find((part) => /^(#|rgb)/.test(part))
  if (word && word !== value) return color(word, mode)
  throw new Error(`unsupported color value "${raw}"`)
}

function tokensFor(mode) {
  const tokens = {}
  for (const rule of rules)
    if (applies(rule, mode) && rule.selectors.some((s) => s === ':root' || s === 'html'))
      for (const [prop, value] of rule.decls) if (prop.startsWith('--')) tokens[prop] = value
  return tokens
}
function computed(selector, prop, mode) {
  const decls = declarations(selector, mode)
  const raw = prop === 'background' ? decls.bg : decls[prop]
  if (raw === undefined) return undefined
  return color(resolve(raw, mode, tokensFor(mode)), mode)
}
const over = ([r, g, b, a], [R, G, B]) => [
  r * a + R * (1 - a),
  g * a + G * (1 - a),
  b * a + B * (1 - a),
  1,
]
const lum = ([r, g, b]) => {
  const c = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const hex = (c) =>
  c
    ? '#' +
      c
        .slice(0, 3)
        .map((v) => Math.round(v).toString(16).padStart(2, '0'))
        .join('') +
      (c[3] < 1 ? `/${c[3]}` : '')
    : 'none'

const EXPECTED = {
  light: {
    'body color': '#111827',
    'body background': '#ffffff',
    '.card background': '#f8fafc',
    '.muted color': '#4b5563',
    '.status--ok color': '#15803d',
    '.status--down color': '#b91c1c',
    '.badge color': '#1f2937',
    '.badge background': '#e5e7eb',
    '.button color': '#ffffff',
    '.button background': '#2563eb',
    '.button:disabled color': '#4b5563',
    '.button:disabled background': '#e5e7eb',
  },
  dark: {
    'body color': '#f3f4f6',
    'body background': '#0b1120',
    '.card background': '#111827',
    '.muted color': '#9ca3af',
    '.status--ok color': '#4ade80',
    '.status--down color': '#f87171',
    '.button color': '#0b1120',
    '.button background': '#60a5fa',
  },
}
for (const [mode, pairs] of Object.entries(EXPECTED))
  for (const [key, want] of Object.entries(pairs)) {
    const [selector, prop] = key.split(' ')
    assert.equal(hex(computed(selector, prop, mode)), want, `${mode} ${key} is unchanged`)
  }
const page = computed('.card', 'background', 'dark')
for (const [selector, min] of [
  ['.badge', 4.5],
  ['.button:disabled', 3],
]) {
  const bg = over(computed(selector, 'background', 'dark') ?? [0, 0, 0, 0], page)
  const fg = over(computed(selector, 'color', 'dark'), bg)
  const ratio = contrast(fg, bg)
  assert.ok(ratio >= min, `dark ${selector} text contrast ${ratio.toFixed(2)} is below ${min}`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
