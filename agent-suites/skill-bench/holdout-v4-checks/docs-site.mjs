// Hidden acceptance for the docs sticky table of contents: at desktop widths the contents panel is
// sticky with no scrolling or hidden-overflow ancestor and is not stretched to the row height,
// wide code scrolls inside its block without widening the page, and the phone layout and the
// rest of the look are unchanged. A small cascade resolver stands in for a browser.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
// A small CSS cascade: nested @media/@supports/@layer blocks, compound selectors with descendant
// child and sibling combinators, :is/:where/:not, state pseudo-classes, specificity, !important,
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
    if (combinator === '+') return at(node.prev, index - 1)
    if (combinator === '~') {
      for (let side = node.prev; side; side = side.prev) if (at(side, index - 1)) return true
      return false
    }
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

/** Element factory: el('button.btn.btn--danger', parent, { states: ['hover'], prev }) */
function el(spec, parent = null, { states = [], attrs = {}, prev = null } = {}) {
  const [, tag, rest = ''] = spec.match(/^([\w-]+)((?:[.#][\w-]+)*)$/)
  const classes = new Set([...rest.matchAll(/\.([\w-]+)/g)].map((m) => m[1]))
  const id = rest.match(/#([\w-]+)/)?.[1]
  return { tag, classes, id, parent, prev, states: new Set(states), attrs }
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

// The page's structure: html > body > .page > (header.site-header, .layout > (nav.toc,
// main.content > article > pre > code)).
const dir = process.argv[2]
const { computed } = createCascade(readFileSync(join(dir, 'styles.css'), 'utf8'))
const html = el('html')
const body = el('body', html)
const page = el('div.page', body)
const header = el('header.site-header', page)
const layout = el('div.layout', page, { prev: header })
const toc = el('nav.toc', layout)
const content = el('main.content', layout, { prev: toc })
const article = el('article', content)
const pre = el('pre', article)
const code = el('code', pre)
const get = (node, prop, env) => (computed(node, prop, env) ?? '').trim().toLowerCase()
const isLength = (v) => /^(0|-?[\d.]+(px|rem|em|%|vw|ch))$/.test(v)
const SCROLLERS = new Set(['hidden', 'auto', 'scroll'])

function tracks(env) {
  const template = get(layout, 'grid-template-columns', env).replace(
    /repeat\(\s*(\d+)\s*,\s*([^()]*(?:\([^()]*\))?)\)/g,
    (_, n, t) => Array(Number(n)).fill(t).join(' '),
  )
  return splitTop(template, ' ')
}

function contentCanShrink(env) {
  const list = tracks(env)
  const track = list[list.length > 1 ? 1 : 0] ?? 'auto'
  return (
    /^minmax\(\s*0(px|%|rem)?\s*,/.test(track) ||
    isLength(track) ||
    isLength(get(content, 'min-width', env)) ||
    [...SCROLLERS, 'clip'].includes(get(content, 'overflow-x', env)) ||
    /\b(size|inline-size|strict)\b/.test(get(content, 'contain', env))
  )
}

function codeStaysReadable(env) {
  if (SCROLLERS.has(get(pre, 'overflow-x', env)) && get(pre, 'overflow-x', env) !== 'hidden')
    return true
  const space = get(code, 'white-space', env)
  return ['pre-wrap', 'break-spaces', 'pre-line', 'normal'].includes(space)
}

for (const width of [1280, 1024, 900]) {
  const env = { width }
  assert.equal(get(toc, 'position', env), 'sticky', `${width}px: the contents panel is sticky`)
  assert.ok(
    get(toc, 'top', env) && get(toc, 'top', env) !== 'auto',
    `${width}px: it has a top offset`,
  )
  for (const [name, node] of [
    ['.layout', layout],
    ['.page', page],
    ['body', body],
    ['html', html],
  ])
    for (const axis of ['overflow-x', 'overflow-y'])
      assert.ok(
        !SCROLLERS.has(get(node, axis, env)),
        `${width}px: ${name} has ${axis}: ${get(node, axis, env)}, which makes it the sticky panel's scroll container`,
      )
  const self = get(toc, 'align-self', env)
  const items = get(layout, 'align-items', env)
  const START = ['start', 'flex-start', 'self-start']
  assert.ok(
    START.includes(self) ||
      (['', 'auto', 'normal'].includes(self) && START.includes(items)) ||
      ['fit-content', 'max-content', 'min-content'].includes(get(toc, 'height', env)),
    `${width}px: the panel is stretched to the full row height, so it has no room to stick`,
  )
  assert.ok(
    contentCanShrink(env),
    `${width}px: the content column still grows to fit the widest code line`,
  )
  assert.ok(codeStaysReadable(env), `${width}px: the code block neither scrolls nor wraps`)
}

for (const width of [375, 600]) {
  const env = { width }
  assert.equal(
    get(toc, 'position', env),
    'static',
    `${width}px: the panel stays in the flow on phones`,
  )
  assert.equal(tracks(env).length, 1, `${width}px: phones keep a single column`)
  assert.ok(contentCanShrink(env), `${width}px: the content column can shrink to the screen`)
  assert.ok(codeStaysReadable(env), `${width}px: the code block neither scrolls nor wraps`)
}

const desktop = { width: 1280 }
assert.ok(['16rem', '256px'].includes(tracks(desktop)[0]), 'the contents column keeps its width')
assert.equal(get(header, 'position', desktop), 'sticky', 'the site header still sticks')
assert.equal(get(pre, 'background-color', desktop), '#f5f7fa')
assert.equal(get(el('a', toc), 'color', desktop), '#5b6474')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
