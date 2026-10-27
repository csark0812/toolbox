// Hidden acceptance for the vintage rally entries page: at rest, at 1280px and 390px, it looks
// exactly as before and the entries still animate in. Then, hit-testing with elementFromPoint: the
// sticky header is on top everywhere once scrolled over the map; every Classes dropdown link is on
// top of what is under it; each Concours badge's note shows in full on top of the cards around it
// when hovered; and the entry form's backdrop covers the whole window (header and map included) at
// several scroll positions, with the dialog centred in the window and every field and button on
// top. index.html, app.js and map.css are unchanged.
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
  --bg: #f4efe6;
  --surface: #ffffff;
  --ink: #2a2522;
  --muted: #6a625b;
  --brand: #7a2e1d;
  --on-brand: #ffffff;
  --line: #ddd3c4;
  --radius: 12px;
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

/* Header: sticks to the top while you scroll, with the Classes dropdown in it. */

.site-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 24px;
  background: var(--brand);
  color: var(--on-brand);
}

.brand {
  margin-right: auto;
  color: var(--on-brand);
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.site-nav a,
.menu-btn {
  color: var(--on-brand);
  font: inherit;
  text-decoration: none;
}

.menu-btn {
  padding: 6px 10px;
  border: 1px solid rgb(255 255 255 / 0.5);
  border-radius: 6px;
  background: transparent;
}

.dropdown {
  position: relative;
}

.menu {
  position: absolute;
  z-index: 1000;
  top: calc(100% + 10px);
  right: 0;
  display: none;
  width: 230px;
  margin: 0;
  padding: 6px 0;
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.18);
  list-style: none;
}

.menu.is-open {
  display: block;
}

.menu a {
  display: block;
  padding: 8px 16px;
  color: var(--ink);
}

/* Page */

.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.route-map {
  position: relative;
  height: 300px;
  margin: 0 -24px;
  overflow: hidden;
}

.intro {
  padding: 28px 0 8px;
}

h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.intro p {
  max-width: 62ch;
  margin: 0 0 16px;
}

.open-entry,
.modal__send {
  padding: 10px 18px;
  border: 0;
  border-radius: 8px;
  background: var(--brand);
  color: var(--on-brand);
  font: inherit;
  font-weight: 700;
}

/* Entries rise into place as the page loads. */

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.entries {
  animation: rise 0.4s ease-out both;
}

.entries h2 {
  margin: 24px 0 14px;
  font-size: 1.4rem;
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.entry-card {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
  transition: transform 0.2s ease;
  will-change: transform;
}

.entry-card:hover {
  transform: translateY(-3px);
}

.entry-card__photo {
  height: 140px;
  background: linear-gradient(135deg, #c9b79c, #8d7a62);
}

.entry-card__photo--2,
.entry-card__photo--6 {
  background: linear-gradient(135deg, #a8b9a0, #5f7a5a);
}

.entry-card__photo--3,
.entry-card__photo--7 {
  background: linear-gradient(135deg, #b8c4d6, #63738f);
}

.entry-card__body {
  padding: 12px 16px 0;
}

.entry-card h3 {
  margin: 0;
  font-size: 1.05rem;
}

.entry-card__owner {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.entry-card__foot {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 14px;
}

.entry-card__class {
  color: var(--muted);
  font-size: 0.85rem;
}

.badge {
  padding: 2px 10px;
  border: 1px solid #b08d2e;
  border-radius: 999px;
  background: #fbf3dc;
  color: #6b5312;
  font: inherit;
  font-size: 0.8rem;
}

/* The badge's note pops out below it on hover or keyboard focus. */
.tip {
  position: absolute;
  top: calc(100% - 6px);
  right: 12px;
  display: none;
  width: 220px;
  padding: 8px 10px;
  border-radius: 6px;
  background: #2a2522;
  color: #ffffff;
  font-size: 0.85rem;
  line-height: 1.4;
}

.badge:hover + .tip,
.badge:focus-visible + .tip {
  display: block;
}

/* Entry form dialog */

.modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: none;
  place-items: center;
  padding: 16px;
  background: rgb(20 16 12 / 0.55);
}

.modal.is-open {
  display: grid;
}

.modal__dialog {
  width: min(440px, 100%);
  padding: 24px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.3);
}

.modal__dialog h2 {
  margin: 0 0 16px;
}

.modal__form {
  display: grid;
  gap: 12px;
}

.modal__form label {
  display: grid;
  gap: 4px;
  font-weight: 700;
}

.modal__form input,
.modal__form select {
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: 6px;
  font: inherit;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.modal__close {
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: transparent;
  font: inherit;
}

.site-footer {
  padding: 24px;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 600px) {
  .site-header {
    padding: 10px 16px;
  }

  .page {
    padding: 0 16px 40px;
  }

  .route-map {
    height: 220px;
    margin: 0 -16px;
  }
}
`
const FROZEN = {
  'index.html': '65856793d597e50ecfe443f9210f280d53941aec987c7258dc5082eb0d0c0b05',
  'app.js': '716b9583c3fb463541fe7a98a04aa034ec9a0e34d094103fa8b8dceee29c60d6',
  'map.css': '654c5aa016decd2ccd08cfe1986c6f8d87efd60364acae86ca1f72967b8d39bd',
}

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

// The markup, script and the map library's stylesheet stay as they were.
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

async function open(width, original) {
  const page = await browser.newPage({ viewport: { width, height: 720 } })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.goto(url)
  await page.waitForLoadState('load')
  await page.mouse.move(width - 2, 718)
  await page.waitForTimeout(700)
  return page
}

const PROPS = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'opacity',
  'visibility',
  'display',
  'box-shadow',
]

const snapshot = (page) =>
  page.evaluate((props) => {
    const seen = new Map()
    const out = {}
    for (const el of document.body.querySelectorAll('*')) {
      const base = `${el.tagName.toLowerCase()}.${el.className}|${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 30)}`
      const n = (seen.get(base) ?? 0) + 1
      seen.set(base, n)
      const r = el.getBoundingClientRect()
      const c = getComputedStyle(el)
      out[`${base}#${n}`] = {
        rect: [r.left, r.top + window.scrollY, r.width, r.height].map((v) => Math.round(v * 2) / 2),
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

// The share of sample points across `selector`'s box (inside the window) where it is what you hit.
const onTop = (page, selector, index = 0, grid = [5, 3]) =>
  page.evaluate(
    ([selector, index, [nx, ny]]) => {
      const el = document.querySelectorAll(selector)[index]
      if (!el) return { share: 0, what: 'missing' }
      const r = el.getBoundingClientRect()
      const left = Math.max(r.left, 0) + 3
      const right = Math.min(r.right, window.innerWidth) - 3
      const top = Math.max(r.top, 0) + 3
      const bottom = Math.min(r.bottom, window.innerHeight) - 3
      if (right <= left || bottom <= top) return { share: 0, what: 'not in the window' }
      let ok = 0
      let n = 0
      let what = ''
      for (let i = 0; i < nx; i += 1)
        for (let j = 0; j < ny; j += 1) {
          const x = left + ((right - left) * i) / (nx - 1)
          const y = top + ((bottom - top) * j) / (ny - 1)
          const hit = document.elementFromPoint(x, y)
          n += 1
          if (hit && el.contains(hit)) ok += 1
          else what ||= hit ? `${hit.tagName.toLowerCase()}.${hit.className}` : 'nothing'
        }
      return { share: ok / n, what }
    },
    [selector, index, grid],
  )

const covered = async (page, selector, index, label) => {
  const { share, what } = await onTop(page, selector, index)
  expect(share === 1, `${label} is not on top everywhere (${what} is over it)`)
}

try {
  for (const width of [1280, 390]) {
    const at = `at ${width}px`
    compare(await snapshot(await open(width, true)), await snapshot(await open(width, false)), at)

    const page = await open(width, false)
    const anim = await page.evaluate(() => {
      const c = getComputedStyle(document.querySelector('.entries'))
      return { name: c.animationName, duration: parseFloat(c.animationDuration) }
    })
    expect(anim.name !== 'none' && anim.duration > 0, `${at}: the entries no longer animate in`)

    // The header over the map.
    for (const y of [120, 260]) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await covered(page, '.site-header', 0, `${at} scrolled ${y}px: the header`)
    }

    // The dropdown.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.click('.menu-btn')
    const links = await page.locator('.menu a').count()
    for (let i = 0; i < links; i += 1)
      await covered(page, '.menu a', i, `${at}: dropdown link ${i + 1}`)
    await page.click('.menu-btn')

    // The badge notes.
    const cards = await page.locator('.badge').count()
    for (let i = 0; i < cards; i += 1) {
      const badge = page.locator('.badge').nth(i)
      await badge.scrollIntoViewIfNeeded()
      await page.evaluate(() => window.scrollBy(0, 120))
      await badge.hover()
      await page.waitForTimeout(250)
      await covered(page, '.tip', i, `${at}: the note on badge ${i + 1}`)
      await page.mouse.move(width - 2, 2)
    }

    // The entry form.
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.click('.open-entry')
    await page.waitForTimeout(100)
    const scrolls = [0, 400, 100000]
    for (const y of scrolls) {
      await page.evaluate((y) => window.scrollTo(0, y), y)
      await page.waitForTimeout(50)
      const where = `${at} with the form open, scrolled ${y === 100000 ? 'to the end' : `${y}px`}`
      const backdrop = await page.evaluate(() => {
        const modal = document.querySelector('.modal')
        const misses = []
        for (const fx of [0.01, 0.25, 0.5, 0.75, 0.99])
          for (const fy of [0.01, 0.05, 0.25, 0.5, 0.75, 0.99]) {
            const hit = document.elementFromPoint(window.innerWidth * fx, window.innerHeight * fy)
            if (!hit || !modal.contains(hit))
              misses.push(hit ? `${hit.tagName.toLowerCase()}.${hit.className}` : 'nothing')
          }
        const r = document.querySelector('.modal__dialog').getBoundingClientRect()
        return {
          misses,
          dx: r.left + r.width / 2 - window.innerWidth / 2,
          dy: r.top + r.height / 2 - window.innerHeight / 2,
          inside:
            r.left >= 0 &&
            r.top >= 0 &&
            r.right <= window.innerWidth &&
            r.bottom <= window.innerHeight,
        }
      })
      expect(
        backdrop.misses.length === 0,
        `${where}: the backdrop does not cover the window (${[...new Set(backdrop.misses)].join(', ')} shows)`,
      )
      expect(
        backdrop.inside && Math.abs(backdrop.dx) <= 2 && Math.abs(backdrop.dy) <= 2,
        `${where}: the dialog is not centred in the window (off by ${Math.round(backdrop.dx)}, ${Math.round(backdrop.dy)})`,
      )
      for (const sel of ['.modal__form input', '.modal__form select', '.modal__form button']) {
        const n = await page.locator(sel).count()
        for (let i = 0; i < n; i += 1) await covered(page, sel, i, `${where}: ${sel} ${i + 1}`)
      }
    }
    await page.close()
  }
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, Number(process.env.CHECK_SHOW ?? 14)).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
