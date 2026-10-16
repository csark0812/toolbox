// Hidden acceptance for the settings dialog: every button shows a visible keyboard focus
// indicator, Delete account stays readable on hover, and every other color is unchanged.
// A small cascade resolver (specificity, states, inheritance, tokens) stands in for a browser.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// A small CSS cascade: nested @media/@supports/@layer blocks, compound selectors with descendant
// and child combinators, :is/:where/:not, state pseudo-classes, specificity, !important,
// inheritance, custom properties with var() fallbacks and a few shorthands.
const INHERITED = new Set([
  'color',
  'overflow-wrap',
  'word-break',
  'white-space',
  'font',
  'font-family',
  'font-size',
  'visibility',
  'cursor',
])
const UA = {
  html: { display: 'block' },
  body: { display: 'block' },
  div: { display: 'block' },
  main: { display: 'block' },
  nav: { display: 'block' },
  article: { display: 'block' },
  header: { display: 'block' },
  section: { display: 'block' },
  footer: { display: 'block' },
  form: { display: 'block' },
  p: { display: 'block' },
  h1: { display: 'block' },
  h2: { display: 'block' },
  pre: { display: 'block', 'white-space': 'pre' },
  dialog: { display: 'block' },
  fieldset: { display: 'block' },
  button: { display: 'inline-block' },
}

function splitTop(text, sep) {
  const parts = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    else if (c === sep && depth === 0) {
      parts.push(text.slice(start, i))
      start = i + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map((p) => p.trim()).filter((p) => p !== '')
}

function expand(prop, value) {
  const parts = splitTop(value.replace(/\s+/g, ' '), ' ')
  if (prop === 'overflow')
    return [
      ['overflow-x', parts[0]],
      ['overflow-y', parts[1] ?? parts[0]],
    ]
  if (prop === 'word-wrap') return [['overflow-wrap', value]]
  if (prop === 'background') {
    const color = parts.find((p) =>
      /^(#|rgb|hsl|var\(|light-dark|color-mix|transparent|white|black|currentcolor|red)/i.test(p),
    )
    return color ? [['background-color', color]] : []
  }
  if (prop === 'outline') {
    const out = [
      ['outline-style', 'none'],
      ['outline-width', 'medium'],
      ['outline-color', 'currentcolor'],
    ]
    for (const p of parts) {
      if (/^(none|hidden|solid|dashed|dotted|double|groove|ridge|inset|outset|auto)$/i.test(p))
        out[0][1] = p
      else if (/^(thin|medium|thick|[\d.]+(px|rem|em)|0)$/i.test(p)) out[1][1] = p
      else out[2][1] = p
    }
    return out
  }
  return [[prop, value]]
}

function parse(css) {
  const text = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const rules = []
  let order = 0
  ;(function walk(chunk, media) {
    let i = 0
    while (i < chunk.length) {
      const open = chunk.indexOf('{', i)
      if (open === -1) break
      const head = chunk.slice(i, open).trim()
      let depth = 1
      let j = open + 1
      while (depth && j < chunk.length) {
        if (chunk[j] === '{') depth++
        else if (chunk[j] === '}') depth--
        j++
      }
      const body = chunk.slice(open + 1, j - 1)
      if (head.startsWith('@media')) walk(body, [...media, head.slice(6).trim()])
      else if (head.startsWith('@supports') || head.startsWith('@layer')) walk(body, media)
      else if (!head.startsWith('@')) {
        const decls = []
        for (const part of splitTop(body, ';')) {
          const colon = part.indexOf(':')
          if (colon === -1) continue
          const prop = part.slice(0, colon).trim().toLowerCase()
          let value = part.slice(colon + 1).trim()
          const important = /!\s*important$/i.test(value)
          value = value.replace(/\s*!\s*important$/i, '')
          for (const [p, v] of prop.startsWith('--') ? [[prop, value]] : expand(prop, value))
            decls.push({ prop: p, value: v, important })
        }
        rules.push({ media, selectors: splitTop(head, ','), decls, order: order++ })
      }
      i = j
    }
  })(text, [])
  return rules
}

const px = (value) => {
  const m = String(value)
    .trim()
    .match(/^(-?[\d.]+)(px|rem|em)?$/)
  if (!m) return NaN
  return Number(m[1]) * (m[2] === 'rem' || m[2] === 'em' ? 16 : 1)
}

function featureMatches(feature, env) {
  const f = feature.replace(/[()]/g, '').trim()
  let m = f.match(/^(min|max)-width\s*:\s*(.+)$/)
  if (m) return m[1] === 'min' ? env.width >= px(m[2]) : env.width <= px(m[2])
  m = f.match(/^width\s*(<=|<|>=|>)\s*(.+)$/)
  if (m) {
    const v = px(m[2])
    return { '<=': env.width <= v, '<': env.width < v, '>=': env.width >= v, '>': env.width > v }[
      m[1]
    ]
  }
  m = f.match(/^(.+?)\s*(<=|<|>=|>)\s*width$/)
  if (m) {
    const v = px(m[1])
    return { '<=': v <= env.width, '<': v < env.width, '>=': v >= env.width, '>': v > env.width }[
      m[2]
    ]
  }
  m = f.match(/^prefers-color-scheme\s*:\s*(\w+)$/)
  if (m) return m[1] === (env.scheme ?? 'light')
  m = f.match(/^(hover|any-hover)\s*:\s*(\w+)$/)
  if (m) return m[2] === 'hover'
  m = f.match(/^(pointer|any-pointer)\s*:\s*(\w+)$/)
  if (m) return m[2] === 'fine'
  return false
}

function mediaMatches(list, env) {
  return list.every((query) =>
    splitTop(query, ',').some((part) => {
      let q = part.trim().toLowerCase()
      let negate = false
      if (q.startsWith('not ')) {
        negate = true
        q = q.slice(4)
      }
      q = q.replace(/^only\s+/, '')
      const tokens = q.split(/\s+and\s+/)
      const ok = tokens.every((t) => {
        if (t === 'screen' || t === 'all') return true
        if (t === 'print') return false
        return featureMatches(t, env)
      })
      return negate ? !ok : ok
    }),
  )
}

// Selector parsing: a selector is a list of [combinator, compound] steps.
function parseSelector(text) {
  const steps = []
  let i = 0
  let combinator = ' '
  const s = text.trim()
  while (i < s.length) {
    if (/\s/.test(s[i]) || s[i] === '>' || s[i] === '+' || s[i] === '~') {
      let c = ' '
      while (i < s.length && (/\s/.test(s[i]) || '>+~'.includes(s[i]))) {
        if (s[i] !== ' ' && !/\s/.test(s[i])) c = s[i]
        i++
      }
      combinator = c
      continue
    }
    let j = i
    let depth = 0
    while (j < s.length && (depth > 0 || !(/\s/.test(s[j]) || '>+~'.includes(s[j])))) {
      if (s[j] === '(' || s[j] === '[') depth++
      else if (s[j] === ')' || s[j] === ']') depth--
      j++
    }
    steps.push([combinator, s.slice(i, j)])
    combinator = ' '
    i = j
  }
  return steps
}

function compoundParts(compound) {
  const parts = []
  let i = 0
  while (i < compound.length) {
    const c = compound[i]
    if (c === '.' || c === '#') {
      const m = compound.slice(i + 1).match(/^[\w-]+/)
      parts.push([c, m[0]])
      i += 1 + m[0].length
    } else if (c === '[') {
      const end = compound.indexOf(']', i)
      parts.push(['[', compound.slice(i + 1, end)])
      i = end + 1
    } else if (c === ':') {
      const element = compound[i + 1] === ':'
      const m = compound.slice(i + (element ? 2 : 1)).match(/^[\w-]+/)
      let k = i + (element ? 2 : 1) + m[0].length
      let arg = null
      if (compound[k] === '(') {
        let depth = 1
        let e = k + 1
        while (depth && e < compound.length) {
          if (compound[e] === '(') depth++
          else if (compound[e] === ')') depth--
          e++
        }
        arg = compound.slice(k + 1, e - 1)
        k = e
      }
      parts.push([element ? '::' : ':', m[0].toLowerCase(), arg])
      i = k
    } else {
      const m = compound.slice(i).match(/^(\*|[\w-]+)/)
      parts.push(['tag', m[0].toLowerCase()])
      i += m[0].length
    }
  }
  return parts
}

const STATES = new Set([
  'hover',
  'focus',
  'focus-visible',
  'active',
  'disabled',
  'focus-within',
  'checked',
])
function matchCompound(el, compound) {
  for (const [kind, name, arg] of compoundParts(compound)) {
    if (kind === 'tag' && name !== '*' && name !== el.tag) return false
    if (kind === '.' && !el.classes.has(name)) return false
    if (kind === '#' && el.id !== name) return false
    if (kind === '[') {
      const [attr, val] = name.split('=')
      const value = el.attrs?.[attr.trim()]
      if (value === undefined) return false
      if (val !== undefined && value !== val.replace(/["']/g, '').trim()) return false
    }
    if (kind === '::') return false
    if (kind === ':') {
      if (name === 'root') {
        if (el.tag !== 'html') return false
      } else if (name === 'enabled') {
        if (el.states.has('disabled')) return false
      } else if (STATES.has(name)) {
        if (!el.states.has(name)) return false
      } else if (name === 'is' || name === 'where' || name === 'matches') {
        if (!splitTop(arg, ',').some((sel) => matches(el, sel))) return false
      } else if (name === 'not') {
        if (splitTop(arg, ',').some((sel) => matches(el, sel))) return false
      } else return false
    }
  }
  return true
}

function matches(el, selector) {
  const steps = parseSelector(selector)
  const at = (node, index) => {
    if (!node || !matchCompound(node, steps[index][1])) return false
    if (index === 0) return true
    const combinator = steps[index][0]
    if (combinator === '>') return at(node.parent, index - 1)
    if (combinator === ' ') {
      for (let up = node.parent; up; up = up.parent) if (at(up, index - 1)) return true
      return false
    }
    return false
  }
  return at(el, steps.length - 1)
}

function specificity(selector) {
  let a = 0
  let b = 0
  let c = 0
  for (const [, compound] of parseSelector(selector))
    for (const [kind, name, arg] of compoundParts(compound)) {
      if (kind === '#') a++
      else if (kind === '.' || kind === '[') b++
      else if (kind === 'tag' && name !== '*') c++
      else if (kind === '::') c++
      else if (kind === ':') {
        if (name === 'where') continue
        if (name === 'is' || name === 'not' || name === 'matches') {
          const best = splitTop(arg, ',')
            .map(specificity)
            .sort((x, y) => y[0] - x[0] || y[1] - x[1] || y[2] - x[2])[0] ?? [0, 0, 0]
          a += best[0]
          b += best[1]
          c += best[2]
        } else b++
      }
    }
  return [a, b, c]
}

/** Element factory: el('button.btn.btn--danger', parent, { states: ['hover'] }) */
function el(spec, parent = null, { states = [], attrs = {} } = {}) {
  const [, tag, rest = ''] = spec.match(/^([\w-]+)((?:[.#][\w-]+)*)$/)
  const classes = new Set([...rest.matchAll(/\.([\w-]+)/g)].map((m) => m[1]))
  const id = rest.match(/#([\w-]+)/)?.[1]
  return { tag, classes, id, parent, states: new Set(states), attrs }
}

function createCascade(css) {
  const rules = parse(css)
  function declared(element, prop, env) {
    let best = null
    for (const rule of rules) {
      if (!mediaMatches(rule.media, env)) continue
      const hits = rule.selectors.filter((sel) => {
        try {
          return matches(element, sel)
        } catch {
          return false
        }
      })
      if (!hits.length) continue
      const spec = hits
        .map(specificity)
        .sort((x, y) => y[0] - x[0] || y[1] - x[1] || y[2] - x[2])[0]
      for (const decl of rule.decls) {
        if (decl.prop !== prop) continue
        const key = [decl.important ? 1 : 0, ...spec, rule.order]
        if (!best || compareKeys(key, best.key) >= 0) best = { key, value: decl.value }
      }
    }
    return best?.value
  }
  const compareKeys = (x, y) => {
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] - y[i]
    return 0
  }
  function computed(element, prop, env) {
    if (!element) return prop.startsWith('--') ? undefined : undefined
    let value = declared(element, prop, env)
    const inherits = prop.startsWith('--') || INHERITED.has(prop)
    if (value === undefined || value === 'inherit' || (value === 'unset' && inherits)) {
      if (value === undefined && UA[element.tag]?.[prop] !== undefined && !inherits)
        return UA[element.tag][prop]
      if (value === undefined && UA[element.tag]?.[prop] !== undefined && inherits)
        return UA[element.tag][prop]
      if (inherits || value === 'inherit') return computed(element.parent, prop, env)
      return undefined
    }
    if (value === 'initial' || value === 'unset' || value === 'revert') return undefined
    return resolveVars(element, value, env)
  }
  function resolveVars(element, value, env, depth = 0) {
    if (depth > 20) throw new Error('var() cycle')
    return value.replace(
      /var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g,
      (_, name, fallback) => {
        const v = computed(element, name, env)
        if (v !== undefined) return resolveVars(element, v, env, depth + 1)
        if (fallback !== undefined) return resolveVars(element, fallback, env, depth + 1)
        return ''
      },
    )
  }
  return { computed, rules }
}

const dir = process.argv[2]
const { computed } = createCascade(readFileSync(join(dir, 'styles.css'), 'utf8'))
const env = { width: 1024 }
const html = el('html')
const body = el('body', html)
const dialog = el('div.dialog', body, { attrs: { role: 'dialog' } })
const form = el('form.form', dialog)
const zone = el('section.danger-zone', form)
const actions = el('div.actions', form)
const button = (spec, parent, states = []) =>
  el(spec, parent, { states, attrs: { type: spec.includes('primary') ? 'submit' : 'button' } })
const VARIANTS = {
  plain: (states) => button('button.btn', actions, states),
  primary: (states) => button('button.btn.btn--primary', actions, states),
  danger: (states) => button('button.btn.btn--danger', zone, states),
}

const NAMED = { white: '#ffffff', black: '#000000', transparent: '#0000', red: '#ff0000' }
function color(raw, currentColor) {
  let value = String(raw ?? '')
    .trim()
    .toLowerCase()
  if (value === 'currentcolor') return currentColor
  value = NAMED[value] ?? value
  let hex = value.match(/^#([0-9a-f]{3,8})$/)?.[1]
  if (hex) {
    if (hex.length <= 4) hex = [...hex].map((c) => c + c).join('')
    const n = (k) => parseInt(hex.slice(k, k + 2), 16)
    return [n(0), n(2), n(4), hex.length === 8 ? n(6) / 255 : 1]
  }
  const rgb = value.match(/^rgba?\(([^)]*)\)$/)
  if (rgb) {
    const p = rgb[1].split(/[\s,/]+/).filter(Boolean)
    const ch = (x) => (x.endsWith('%') ? (parseFloat(x) * 255) / 100 : parseFloat(x))
    const alpha =
      p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])
    return [ch(p[0]), ch(p[1]), ch(p[2]), alpha]
  }
  const hsl = value.match(/^hsla?\(([^)]*)\)$/)
  if (hsl) {
    const p = hsl[1].split(/[\s,/]+/).filter(Boolean)
    const h = parseFloat(p[0]) / 360
    const s = parseFloat(p[1]) / 100
    const l = parseFloat(p[2]) / 100
    const alpha =
      p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3])
    const f = (n) => {
      const k = (n + h * 12) % 12
      return 255 * (l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
    }
    return [f(0), f(8), f(4), alpha]
  }
  throw new Error(`unsupported color "${raw}"`)
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
const contrast = (x, y) => {
  const [hi, lo] = [lum(x), lum(y)].sort((m, n) => n - m)
  return (hi + 0.05) / (lo + 0.05)
}
const hex = (c) =>
  '#' +
  c
    .slice(0, 3)
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('')
const lengthPx = (v) =>
  ({ thin: 1, medium: 3, thick: 5 })[v] ?? (/rem|em$/.test(v) ? parseFloat(v) * 16 : parseFloat(v))

const surface = color(computed(dialog, 'background-color', env), null)
function paint(node) {
  const text = color(computed(node, 'color', env), null)
  const raw = computed(node, 'background-color', env)
  const bg = over(raw ? color(raw, text) : [0, 0, 0, 0], surface)
  return { text: over(text, bg), bg }
}

/** A focus indicator someone can see: an outline or a ring-like box-shadow that stands out. */
function focusIndicator(node) {
  const { text } = paint(node)
  const style = (computed(node, 'outline-style', env) ?? 'auto').trim().toLowerCase()
  if (style === 'auto') return { kind: 'browser ring', ok: true }
  if (style !== 'none' && style !== 'hidden') {
    const width = lengthPx((computed(node, 'outline-width', env) ?? 'medium').trim())
    const ring = over(color(computed(node, 'outline-color', env) ?? 'currentcolor', text), surface)
    if (width >= 2 && contrast(ring, surface) >= 1.5) return { kind: 'outline', ok: true }
  }
  const shadow = computed(node, 'box-shadow', env)
  if (shadow && shadow.trim() !== 'none')
    for (const one of splitTop(shadow, ',')) {
      const parts = splitTop(one, ' ').filter((p) => p !== 'inset')
      const lengths = parts.filter((p) => /^-?[\d.]+(px|rem|em)?$/.test(p)).map(px)
      const colorPart = parts.find((p) => !/^-?[\d.]+(px|rem|em)?$/.test(p)) ?? 'currentcolor'
      const spread = lengths[3] ?? 0
      const ring = over(color(colorPart, text), surface)
      if (spread >= 2 && contrast(ring, surface) >= 1.5) return { kind: 'box-shadow', ok: true }
    }
  return { kind: 'none', ok: false }
}

for (const [name, make] of Object.entries(VARIANTS)) {
  const result = focusIndicator(make(['focus', 'focus-visible']))
  assert.ok(result.ok, `the ${name} button shows no visible focus indicator for keyboard focus`)
}
{
  const { text, bg } = paint(VARIANTS.danger(['hover']))
  const ratio = contrast(text, bg)
  assert.ok(ratio >= 4.5, `Delete account on hover: text contrast ${ratio.toFixed(2)} is below 4.5`)
}

// Everything else looks the same.
const EXPECTED = [
  ['plain', [], '#1f2937', '#ffffff'],
  ['plain', ['hover'], '#1f2937', '#f3f4f6'],
  ['primary', [], '#ffffff', '#4f46e5'],
  ['primary', ['hover'], '#ffffff', '#4338ca'],
  ['danger', [], '#dc2626', '#ffffff'],
]
for (const [name, states, fg, bg] of EXPECTED) {
  const painted = paint(VARIANTS[name](states))
  assert.equal(
    hex(painted.text),
    fg,
    `${name} ${states.join('+') || 'rest'} text color is unchanged`,
  )
  assert.equal(hex(painted.bg), bg, `${name} ${states.join('+') || 'rest'} background is unchanged`)
}
assert.equal(
  hex(color(computed(VARIANTS.danger([]), 'border-color', env), null)),
  '#dc2626',
  'the danger border is unchanged',
)
const input = el('input', el('label.field', form), { states: ['focus', 'focus-visible'] })
assert.equal(
  (computed(input, 'box-shadow', env) ?? '').replace(/\s+/g, ' ').trim(),
  '0 0 0 3px rgba(79, 70, 229, 0.35)',
  'the input focus ring is unchanged',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
