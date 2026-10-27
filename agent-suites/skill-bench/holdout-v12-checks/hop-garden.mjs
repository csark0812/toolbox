// Hidden acceptance for the hop garden rota: on screen at 1280px and 390px it looks exactly as
// before. Printed (print media at 718px, A4 portrait with default margins) the menu, filters, Print
// button and Back to top link are gone; nothing is position: fixed; everything fits across the page
// without scroll boxes, scaling or squeezing the tables; every bit of text is at least 4.5:1 on
// white once backgrounds are dropped (opacity counted) and at least 12px; rows avoid page breaks and
// day headings avoid a break after them; every printed link shows its address. index.html and app.js
// are unchanged.
/* global document, getComputedStyle, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #f6f3ea;
  --surface: #ffffff;
  --ink: #23301f;
  --muted: #8b9184;
  --brand: #3d6b2f;
  --brand-dark: #2c4f22;
  --on-brand: #ffffff;
  --line: #dcd8c9;
  --amber: #c98a12;
  --header-h: 64px;
}

/* Printing: leave the buttons and the menu off the paper. */
@media print {
  .site-nav,
  .print-btn,
  .sidebar {
    display: none;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding-top: var(--header-h);
  background: var(--bg);
  color: var(--ink);
  font-family: 'Gill Sans', 'Trebuchet MS', sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

a {
  color: var(--brand);
}

/* Header: stays at the top of the window while you scroll. */

.site-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 24px;
  height: var(--header-h);
  padding: 0 24px;
  background: var(--brand);
  color: var(--on-brand);
}

.brand {
  display: flex;
  flex-direction: column;
  margin-right: auto;
  line-height: 1.2;
}

.brand__name {
  font-size: 1.2rem;
  font-weight: 700;
}

.brand__dates {
  font-size: 0.85rem;
  opacity: 0.8;
}

.site-nav {
  display: flex;
  gap: 18px;
}

.site-nav a {
  color: var(--on-brand);
  text-decoration: none;
}

.print-btn {
  padding: 8px 14px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 6px;
  background: transparent;
  color: var(--on-brand);
  font: inherit;
  font-size: 0.9rem;
}

/* Two columns: the filters on the left, the rota on the right. */

.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px;
}

.sidebar {
  display: block;
  align-self: start;
  padding: 18px;
  border-radius: 10px;
  background: var(--surface);
}

.sidebar__title {
  margin: 0 0 8px;
  font-size: 1rem;
}

.filter {
  display: block;
  padding: 4px 0;
}

.sidebar__hint {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.page {
  min-width: 0;
}

h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.intro {
  max-width: 60ch;
  margin: 0 0 4px;
}

.updated {
  margin: 0 0 24px;
  color: var(--muted);
  font-size: 0.85rem;
}

.day {
  margin-bottom: 32px;
}

.day h2 {
  margin: 0 0 10px;
  font-size: 1.4rem;
}

.day__date {
  color: var(--muted);
  font-weight: 400;
}

/* The rota tables scroll sideways inside their section on narrow screens. */

.day {
  overflow-x: auto;
}

.rota {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  background: var(--surface);
}

.rota th {
  padding: 10px 12px;
  background: var(--brand-dark);
  color: var(--on-brand);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-align: left;
  text-transform: uppercase;
}

.rota td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.rota tr.is-cancelled {
  opacity: 0.45;
}

.status {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: 700;
}

.status--full {
  background: var(--brand);
}

.status--short {
  background: var(--amber);
}

.status--cancelled {
  background: #7d7d7d;
}

.notes {
  padding: 20px;
  border-left: 4px solid var(--brand);
  border-radius: 10px;
  background: var(--surface);
}

.notes h2 {
  margin: 0 0 8px;
  font-size: 1.2rem;
}

.notes__small {
  margin-bottom: 0;
  color: var(--muted);
  font-size: 0.85rem;
}

.site-footer {
  padding: 24px;
  background: var(--brand-dark);
  color: #cfe0c6;
  text-align: center;
}

.site-footer a {
  color: #ffffff;
}

.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 20px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--brand);
  color: var(--on-brand);
  font-size: 0.85rem;
  text-decoration: none;
}

@media (max-width: 640px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .site-nav {
    display: none;
  }
}
`
const FROZEN = {
  'index.html': '50b4c0ff69d400b21422eb4ac1ed05389a8df99a3dda6a54280b3a05679fe005',
  'app.js': '3118d7be1e2a1661158f5bb2ba4f178e2d1f0b8978b3afa76139e25c3894e7c0',
}

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

// The markup and script are generated, so they stay as they were.
for (const [file, hash] of Object.entries(FROZEN))
  expect(
    createHash('sha256')
      .update(readFileSync(join(dir, file)))
      .digest('hex') === hash,
    `${file} was changed`,
  )

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})

async function open(width, media, original) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.emulateMedia({ media })
  await page.goto(url)
  await page.waitForLoadState('load')
  await page.mouse.move(width - 2, 898)
  return page
}

const PROPS = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'opacity',
  'position',
  'visibility',
  'white-space',
]

// Every element's box and look, keyed by tag, class and text so the same element always matches.
const snapshot = (page) =>
  page.evaluate((props) => {
    const seen = new Map()
    const out = {}
    for (const el of document.body.querySelectorAll('*')) {
      const base = `${el.tagName.toLowerCase()}.${el.className}|${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}`
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

const compare = (was, now, at) => {
  for (const [key, b] of Object.entries(was)) {
    const a = now[key]
    if (!a) {
      expect(false, `${at}: ${key} is gone`)
      continue
    }
    expect(
      a.rect.every((v, i) => Math.abs(v - b.rect[i]) <= 1),
      `${at}: ${key} is at ${a.rect} (was ${b.rect})`,
    )
    for (const p of Object.keys(b.style))
      expect(
        a.style[p] === b.style[p],
        `${at}: ${key} ${p} is ${a.style[p]} (expected ${b.style[p]})`,
      )
  }
}

try {
  // On screen, nothing changes.
  for (const width of [1280, 390])
    compare(
      await snapshot(await open(width, 'screen', true)),
      await snapshot(await open(width, 'screen', false)),
      `on screen at ${width}px`,
    )

  // Printed on A4 portrait with the default margins: about 718 CSS pixels across.
  const PRINT_W = 718
  const page = await open(PRINT_W, 'print', false)
  const report = await page.evaluate((W) => {
    const out = []
    const say = (m) => out.push(m)
    const shown = (el) => {
      if (!el.isConnected) return false
      const c = getComputedStyle(el)
      if (c.display === 'none' || c.visibility !== 'visible') return false
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    }
    const name = (el) =>
      `${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ')[0]}` : ''} "${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 24)}"`
    const ancestors = (el) => {
      const list = []
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) list.push(n)
      return list
    }

    // What stays off the paper, and what prints.
    for (const sel of ['.site-nav', '.sidebar', '.print-btn', '.back-to-top'])
      for (const el of document.querySelectorAll(sel)) if (shown(el)) say(`${sel} prints`)
    for (const sel of [
      '.brand__name',
      '.brand__dates',
      'h1',
      '.intro',
      '.updated',
      '#saturday',
      '#sunday',
      '.notes',
      '.site-footer',
    ])
      if (!shown(document.querySelector(sel))) say(`${sel} does not print`)
    for (const el of document.querySelectorAll('.rota tr, .status'))
      if (!shown(el)) say(`${name(el)} does not print`)

    // Nothing repeats on every page, and the header sits at the top of the first page.
    for (const el of document.querySelectorAll('body *'))
      if (shown(el) && getComputedStyle(el).position === 'fixed')
        say(`${name(el)} is position: fixed, so it prints on every page`)
    const header = document.querySelector('.site-header')
    if (header.getBoundingClientRect().top + window.scrollY > 120)
      say('the header is not at the top of the first page')

    // Everything fits across the page, unscaled and not hidden in a scroll box.
    if (document.documentElement.scrollWidth > W + 1)
      say(`the page is ${document.documentElement.scrollWidth}px wide, wider than the paper`)
    for (const el of document.querySelectorAll('body *')) {
      if (!shown(el)) continue
      const r = el.getBoundingClientRect()
      if (r.right > W + 1 || r.left < -1)
        say(`${name(el)} runs off the paper (${Math.round(r.left)} to ${Math.round(r.right)})`)
      const c = getComputedStyle(el)
      if (
        (c.overflowX !== 'visible' || c.overflowY !== 'visible') &&
        (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
      )
        say(`${name(el)} cuts off its content`)
      if (c.transform !== 'none') say(`${name(el)} is transformed`)
      if (c.zoom !== '1' && c.zoom !== 'normal') say(`${name(el)} is zoomed`)
    }
    for (const table of document.querySelectorAll('.rota'))
      if (table.getBoundingClientRect().width < W * 0.75)
        say(`a rota table is squeezed to ${Math.round(table.getBoundingClientRect().width)}px`)

    // Text readable in black ink without backgrounds, and not shrunk.
    const parse = (s) => {
      const m = s.match(/rgba?\(([^)]+)\)/)
      if (!m) return null
      const p = m[1]
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map(Number)
      return { rgb: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }
    }
    const lum = (rgb) => {
      const c = rgb.map((v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    }
    const checkText = (el, c, label) => {
      const col = parse(c.color)
      const opacity = ancestors(el).reduce((o, n) => o * Number(getComputedStyle(n).opacity), 1)
      const a = (col?.a ?? 1) * opacity
      const rgb = (col?.rgb ?? [0, 0, 0]).map((v) => v * a + 255 * (1 - a))
      const ratio = 1.05 / (lum(rgb) + 0.05)
      if (ratio < 4.5) say(`${label} prints at ${ratio.toFixed(2)}:1 on white`)
      if (parseFloat(c.fontSize) < 12) say(`${label} prints at ${c.fontSize}`)
    }
    for (const el of document.querySelectorAll('body *')) {
      if (!shown(el)) continue
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())
      if (hasText) checkText(el, getComputedStyle(el), name(el))
    }

    // Rows stay whole and headings stay with their table.
    const avoid = (v) => v === 'avoid' || v === 'avoid-page'
    for (const tr of document.querySelectorAll('.rota tbody tr'))
      if (
        !avoid(getComputedStyle(tr).breakInside) &&
        ![...tr.cells].every((td) => avoid(getComputedStyle(td).breakInside))
      ) {
        say(`a shift row can split across pages (${name(tr)})`)
        break
      }
    for (const h of document.querySelectorAll('.day h2')) {
      const next = h.nextElementSibling
      if (
        !avoid(getComputedStyle(h).breakAfter) &&
        !(next && avoid(getComputedStyle(next).breakBefore))
      )
        say(`the heading ${name(h)} can be left alone at the foot of a page`)
    }

    // Printed links show where they go.
    for (const a of document.querySelectorAll('a[href]')) {
      if (!shown(a)) continue
      const href = a.getAttribute('href')
      const shows = ['::after', '::before'].some((p) => {
        const content = getComputedStyle(a, p).content
        return content.includes('attr(href)') || content.includes(href)
      })
      if (!shows) say(`the link ${name(a)} does not print its address`)
      else {
        const after = getComputedStyle(a, '::after')
        if (after.content.includes('attr(href)') || after.content.includes(href))
          checkText(a, after, `the address after ${name(a)}`)
      }
    }
    return out
  }, PRINT_W)
  for (const m of report) expect(false, `printed: ${m}`)

  // Printed for real, the rota still comes out on a sensible number of A4 pages.
  const pdf = await page.pdf({ format: 'A4' })
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length
  expect(pages >= 2 && pages <= 5, `printed: the rota comes out on ${pages} pages`)
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, Number(process.env.CHECK_SHOW ?? 14)).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
