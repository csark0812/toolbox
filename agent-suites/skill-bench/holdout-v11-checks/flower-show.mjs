// Hidden acceptance for the flower show page: rendered in Chromium at every width from 320px to
// 900px, nothing on the page reaches past the viewport and the page does not scroll sideways, and
// that is not done by hiding overflow; the show classes, the online entry link and the results stay
// inside their panels, the link is shown in full, and the results table keeps its width and scrolls
// sideways inside its own box; text sizes are as before at every width. At 1024px and 1280px the
// page looks exactly as it did.
/* global document, getComputedStyle, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #f7f5ef;
  --surface: #ffffff;
  --ink: #23301f;
  --muted: #5d6857;
  --accent: #6a2c70;
  --on-accent: #ffffff;
  --leaf: #e4eedc;
  --line: #dcd8cc;
  --radius: 10px;
  --gutter: 16px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.5;
}

a {
  color: var(--accent);
}

/* Header */

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 14px 24px;
  background: var(--accent);
  color: var(--on-accent);
}

.brand {
  color: inherit;
  font-size: 1.35rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.nav {
  display: flex;
  gap: 32px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav a {
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
}

.hero {
  padding: 32px var(--gutter);
  background: var(--leaf);
  text-align: center;
}

.hero h1 {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.4rem);
}

.hero__date {
  margin: 4px 0 0;
  color: var(--muted);
}

/* Layout */

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px var(--gutter);
}

.panel {
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface);
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 1.3rem;
}

.showday {
  grid-column: 2;
  grid-row: 1 / span 3;
  align-self: start;
}

/* Show classes */

.classes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.show-class {
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 8px;
}

.show-class__no {
  margin: 0;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.show-class__name {
  margin: 2px 0 4px;
  font-size: 1.05rem;
}

.show-class__note {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

/* Entering */

.contact {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background: var(--leaf);
}

.contact__label {
  font-weight: 700;
  white-space: nowrap;
}

/* Results */

.results table {
  min-width: 560px;
  width: 100%;
  border-collapse: collapse;
}

.results th,
.results td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--line);
  text-align: left;
}

.results th {
  font-size: 0.9rem;
}

/* Show day */

.times {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 0;
}

.times dt {
  font-weight: 700;
}

.times dd {
  margin: 0;
}

/* Footer */

.site-footer {
  padding: 24px var(--gutter) 40px;
  border-top: 1px solid var(--line);
  text-align: center;
}

.site-footer h2 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.sponsors {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--muted);
}

/* Narrower screens */

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .showday {
    grid-column: auto;
    grid-row: auto;
  }
}

@media (max-width: 600px) {
  .site-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px var(--gutter);
  }

  .nav {
    flex-wrap: wrap;
    gap: 4px 16px;
  }
}
`
const PROPS = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'padding-top',
  'padding-left',
  'border-top-left-radius',
  'opacity',
  'visibility',
]

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})

async function open(width, original) {
  const page = await browser.newPage({ viewport: { width, height: 720 } })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.goto(url)
  await page.waitForLoadState('load')
  return page
}

// Every element's box and look, keyed by tag, id, class and text so moved markup still matches.
const snapshot = (page) =>
  page.evaluate((props) => {
    const seen = new Map()
    const out = {}
    for (const el of document.body.querySelectorAll('*')) {
      const base = `${el.tagName.toLowerCase()}#${el.id}.${el.className}|${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 30)}`
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      const r = el.getBoundingClientRect()
      const c = getComputedStyle(el)
      out[`${base}#${n}`] = {
        rect: [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 2) / 2),
        style: Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)])),
      }
    }
    return out
  }, PROPS)

// Layout problems at a narrow width, measured in the page.
const narrowProblems = (page) =>
  page.evaluate(() => {
    const bad = []
    const vw = window.innerWidth
    const root = document.documentElement
    if (root.scrollWidth > vw) bad.push(`the page is ${root.scrollWidth}px wide`)
    for (const el of [root, document.body]) {
      const c = getComputedStyle(el)
      if (/hidden|clip/.test(c.overflowX) || /hidden|clip/.test(c.overflow))
        bad.push(`${el.tagName.toLowerCase()} hides overflow`)
    }
    const scrolls = (el) => /auto|scroll/.test(getComputedStyle(el).overflowX)
    const insideScroller = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement)
        if (scrolls(p)) return true
      return false
    }
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      const c = getComputedStyle(el)
      const name = `${el.tagName.toLowerCase()}.${el.className}`
      if (!insideScroller(el) && (r.right > vw + 0.5 || r.left < -0.5))
        bad.push(`${name} runs from ${Math.round(r.left)} to ${Math.round(r.right)}`)
      if (/hidden|clip/.test(c.overflowX) && el.scrollWidth > el.clientWidth + 1)
        bad.push(`${name} clips its content`)
    }
    for (const panel of document.querySelectorAll('.panel')) {
      const p = panel.getBoundingClientRect()
      for (const el of panel.querySelectorAll('.show-class, .contact, .contact *, .results')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0) continue
        if (r.left < p.left - 0.5 || r.right > p.right + 0.5)
          bad.push(`${el.tagName.toLowerCase()}.${el.className} pokes out of #${panel.id}`)
      }
    }
    const link = document.querySelector('.contact a')
    if (!link || !/forms\.waltonflowershow\.org\.uk\/entries\/2027/.test(link.textContent))
      bad.push('the online entry link text is gone')
    else {
      const box = link.closest('.contact').getBoundingClientRect()
      for (const r of link.getClientRects())
        if (r.right > box.right + 0.5 || r.left < box.left - 0.5)
          bad.push('the online entry link runs out of its box')
      if (
        getComputedStyle(link).textOverflow === 'ellipsis' ||
        link.scrollWidth > link.clientWidth + 1
      )
        bad.push('the online entry link is cut short')
    }
    const table = document.querySelector('#results table')
    const tr = table.getBoundingClientRect()
    if (tr.width < 559.5) bad.push(`the results table is squashed to ${Math.round(tr.width)}px`)
    const panel = document.getElementById('results').getBoundingClientRect()
    if (tr.width > panel.width - 40 + 0.5) {
      let scroller = null
      for (let p = table.parentElement; p && p !== document.body; p = p.parentElement)
        if (scrolls(p)) {
          scroller = p
          break
        }
      if (!scroller || !document.getElementById('results').contains(scroller))
        bad.push('the results table has no sideways scroll inside its panel')
      else if (scroller.scrollWidth <= scroller.clientWidth)
        bad.push('the results box does not scroll to show the whole table')
    }
    return bad
  })

const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

try {
  for (const width of [320, 360, 390, 414, 480, 600, 700, 768, 900]) {
    const at = `at ${width}px`
    const page = await open(width, false)
    for (const problem of await narrowProblems(page)) fails.push(`${at}: ${problem}`)
    const before = await open(width, true)
    const [was, now] = [await snapshot(before), await snapshot(page)]
    for (const [key, b] of Object.entries(was)) {
      const a = now[key]
      if (!a) continue
      expect(
        a.style['font-size'] === b.style['font-size'],
        `${at}: ${key} font-size is ${a.style['font-size']} (was ${b.style['font-size']})`,
      )
      expect(
        a.style.visibility === b.style.visibility && a.style.opacity === b.style.opacity,
        `${at}: ${key} is hidden`,
      )
    }
    await before.close()
    await page.close()
  }

  for (const width of [1024, 1280]) {
    const at = `at ${width}px`
    const before = await open(width, true)
    const after = await open(width, false)
    const [was, now] = [await snapshot(before), await snapshot(after)]
    for (const [key, b] of Object.entries(was)) {
      const a = now[key]
      if (!a) {
        expect(b.rect[2] === 0 && b.rect[3] === 0, `${at}: ${key} is gone`)
        continue
      }
      expect(
        a.rect.every((v, i) => Math.abs(v - b.rect[i]) <= 1),
        `${at}: ${key} is at ${a.rect} (was ${b.rect})`,
      )
      for (const p of Object.keys(b.style))
        expect(a.style[p] === b.style[p], `${at}: ${key} ${p} is ${a.style[p]} (was ${b.style[p]})`)
    }
    await before.close()
    await after.close()
  }
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, 12).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
