// Hidden acceptance for the parking map: rendered in Chromium at 1280px and 390px wide, the page at
// rest looks exactly as it did; an open car park popup paints over every neighbouring pin, the zoom
// buttons and the legend; the search suggestions paint over the map and its zoom buttons; the sticky
// header stays over the map when the page is scrolled; and the pay dialog is centred in the viewport,
// sized as before, with its dimmed backdrop over the whole page, header included. Cancel closes it.
/* global document, getComputedStyle, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #f4f6f8;
  --surface: #ffffff;
  --ink: #17212b;
  --muted: #5a6773;
  --accent: #0b5c8a;
  --on-accent: #ffffff;
  --tile: #dde8e2;
  --water: #b9d6e8;
  --backdrop: rgb(15 23 42 / 0.55);
  --header-h: 64px;
  --radius: 12px;
  --shadow: 0 6px 20px rgb(15 23 42 / 0.18);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Source Sans 3', system-ui, sans-serif;
  line-height: 1.45;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Header */

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: var(--header-h);
  padding: 0 16px;
  background: var(--accent);
  color: var(--on-accent);
}

.brand {
  color: inherit;
  font-weight: 700;
  text-decoration: none;
}

.search {
  position: relative;
  width: min(320px, 60vw);
}

.search input {
  width: 100%;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  font: inherit;
}

.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 50;
  margin: 0;
  padding: 4px;
  list-style: none;
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.suggestions button {
  display: block;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: 6px;
  background: none;
  color: var(--ink);
  font: inherit;
  text-align: left;
}

.suggestions button:hover {
  background: var(--bg);
}

/* Page */

main {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
}

h1 {
  margin: 8px 0 4px;
  font-size: 1.5rem;
}

.intro {
  margin: 0 0 16px;
  color: var(--muted);
}

/* Map */

.map {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--tile);
  /* keeps panning smooth */
  will-change: transform;
}

.map__tiles {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgb(255 255 255 / 0.7) 2px, transparent 2px) 0 0 / 80px 80px,
    linear-gradient(rgb(255 255 255 / 0.7) 2px, transparent 2px) 0 0 / 80px 80px,
    linear-gradient(160deg, transparent 62%, var(--water) 62%);
}

.map__controls {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zoom {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 8px;
  background: var(--surface);
  box-shadow: var(--shadow);
  color: var(--ink);
  font: inherit;
  font-size: 1.25rem;
}

.marker {
  position: absolute;
  z-index: 1;
}

.marker__pin {
  width: 36px;
  height: 36px;
  border: 2px solid var(--on-accent);
  border-radius: 50% 50% 50% 0;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 700;
}

.marker.is-open .marker__pin {
  background: var(--ink);
}

.popup {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 5;
  width: 220px;
  padding: 12px;
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.popup__name {
  margin: 0;
  font-size: 1.05rem;
}

.popup__free,
.popup__price {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.pay-btn {
  margin-top: 10px;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
}

.legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 2;
  margin: 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.85rem;
}

.legend__pin {
  display: inline-block;
  width: 18px;
  border-radius: 50% 50% 50% 0;
  background: var(--accent);
  color: var(--on-accent);
  font-weight: 700;
  text-align: center;
}

/* Pay dialog */

.modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--backdrop);
}

.modal[hidden] {
  display: none;
}

.modal__panel {
  width: min(420px, 100%);
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.modal__panel h2 {
  margin: 0 0 4px;
}

.modal__where {
  margin: 0 0 12px;
  color: var(--muted);
}

.field {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}

.field input,
.field select {
  padding: 8px 10px;
  border: 1px solid #c3ccd5;
  border-radius: 8px;
  font: inherit;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
}

.btn--ghost {
  background: transparent;
  color: var(--accent);
}

/* Tariffs */

.tariffs {
  margin-top: 24px;
}

.tariffs table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
}

.tariffs th,
.tariffs td {
  padding: 10px 12px;
  border-bottom: 1px solid #e2e7ec;
  text-align: left;
}

.site-footer {
  padding: 24px 16px 48px;
  color: var(--muted);
  text-align: center;
}
`
const PROPS = [
  'color',
  'background-color',
  'background-image',
  'font-size',
  'font-weight',
  'padding-top',
  'padding-left',
  'border-top-left-radius',
  'box-shadow',
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

// Sample a grid of points inside a box (clipped to `within`), plus the middle of its overlap with
// every element on the page; report the points whose topmost element is not inside `owner`.
const misses = (page, ownerSelector, box, within) =>
  page.evaluate(
    ([ownerSelector, box, within]) => {
      const owner = document.querySelector(ownerSelector)
      // Inset far enough to stay clear of rounded corners.
      const left = Math.max(box.left, within.left) + 8
      const right = Math.min(box.right, within.right) - 8
      const top = Math.max(box.top, within.top) + 8
      const bottom = Math.min(box.bottom, within.bottom) - 8
      const points = []
      for (let i = 0; i <= 10; i += 1)
        for (let j = 0; j <= 10; j += 1)
          points.push([left + ((right - left) * i) / 10, top + ((bottom - top) * j) / 10])
      for (const el of document.body.querySelectorAll('*')) {
        if (owner.contains(el)) continue
        const r = el.getBoundingClientRect()
        const l = Math.max(r.left, left)
        const rr = Math.min(r.right, right)
        const t = Math.max(r.top, top)
        const b = Math.min(r.bottom, bottom)
        if (rr - l >= 2 && b - t >= 2) points.push([(l + rr) / 2, (t + b) / 2])
      }
      const bad = []
      for (const [x, y] of points) {
        const hit = document.elementFromPoint(x, y)
        if (!hit || !owner.contains(hit)) {
          const what = hit
            ? `${hit.tagName.toLowerCase()}.${hit.className || ''}${hit.getAttribute('aria-label') ? `[${hit.getAttribute('aria-label')}]` : ''}`
            : 'nothing'
          bad.push(`${Math.round(x)},${Math.round(y)} -> ${what}`)
        }
      }
      return bad
    },
    [ownerSelector, box, within],
  )

const rectOf = (page, selector) =>
  page.evaluate((selector) => {
    const r = document.querySelector(selector).getBoundingClientRect()
    return {
      left: r.left,
      right: r.right,
      top: r.top,
      bottom: r.bottom,
      width: r.width,
      height: r.height,
    }
  }, selector)

const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

try {
  for (const width of [1280, 390]) {
    const at = `at ${width}px`

    // At rest the page looks exactly as before.
    const before = await open(width, true)
    const after = await open(width, false)
    const [was, now] = [await snapshot(before), await snapshot(after)]
    for (const [key, b] of Object.entries(was)) {
      const a = now[key]
      if (!a) {
        expect(b.rect[2] === 0 && b.rect[3] === 0, `${at}: ${key} is still on the page`)
        continue
      }
      if (b.rect[2] > 0 || a.rect[2] > 0)
        expect(
          a.rect.every((v, i) => Math.abs(v - b.rect[i]) <= 1),
          `${at}: ${key} at rest is at ${a.rect} (was ${b.rect})`,
        )
      for (const p of Object.keys(b.style))
        expect(a.style[p] === b.style[p], `${at}: ${key} ${p} is ${a.style[p]} (was ${b.style[p]})`)
    }
    const panelBefore = await before.evaluate(() => {
      document.querySelector('.pay-btn').click()
      const c = getComputedStyle(document.querySelector('.modal__panel'))
      return ['background-color', 'padding-top', 'border-top-left-radius', 'box-shadow'].map((p) =>
        c.getPropertyValue(p),
      )
    })
    await before.close()

    // An open popup paints over everything on the map it covers.
    const map = await rectOf(after, '.map')
    const markers = await after.$$('.marker')
    for (let i = 0; i < markers.length; i += 1) {
      await after.evaluate((i) => document.querySelectorAll('.marker__pin')[i].click(), i)
      const id = `#popup-${i + 1}`
      const visible = await after.evaluate((id) => !document.querySelector(id).hidden, id)
      expect(visible, `${at}: popup ${id} opens`)
      if (!visible) continue
      const box = await rectOf(after, id)
      const bad = await misses(after, id, box, map)
      expect(
        bad.length === 0,
        `${at}: open popup ${id} is covered at ${bad.slice(0, 4).join('; ')}`,
      )
      await after.evaluate((i) => document.querySelectorAll('.marker__pin')[i].click(), i)
    }

    // The search suggestions paint over the map and its zoom buttons.
    await after.click('#q')
    const shown = await after.evaluate(() => !document.getElementById('suggestions').hidden)
    expect(shown, `${at}: suggestions open`)
    if (shown) {
      const list = await rectOf(after, '#suggestions')
      const zoom = await rectOf(after, '.map__controls')
      expect(
        list.bottom > zoom.top && list.left < zoom.right && list.right > zoom.left,
        `${at}: the suggestions overlap the zoom buttons (layout changed?)`,
      )
      const bad = await misses(after, '#suggestions', list, {
        left: 0,
        top: 0,
        right: width,
        bottom: 720,
      })
      expect(bad.length === 0, `${at}: suggestions are covered at ${bad.slice(0, 4).join('; ')}`)
    }
    await after.keyboard.press('Escape')
    await after.click('h1')

    // Scrolled so the map runs under the sticky header, the header stays on top.
    await after.evaluate(() => {
      const top = document.querySelector('.map').getBoundingClientRect().top + window.scrollY
      window.scrollTo(0, top - 20)
    })
    const header = await rectOf(after, '.site-header')
    const mapNow = await rectOf(after, '.map')
    expect(mapNow.top < header.bottom - 30, `${at}: the page scrolls the map under the header`)
    const covered = await misses(after, '.site-header', header, header)
    expect(
      covered.length === 0,
      `${at}: the scrolled map shows through the header at ${covered.slice(0, 4).join('; ')}`,
    )
    await after.evaluate(() => window.scrollTo(0, 0))

    // The pay dialog sits over the whole page, centred in the viewport, sized as before.
    await after.evaluate(() => {
      document.querySelectorAll('.marker__pin')[0].click()
      document.querySelector('.pay-btn').click()
    })
    const dialog = await after.evaluate(() => {
      const panel = [...document.querySelectorAll('[role="dialog"], dialog')].find(
        (el) => el.getBoundingClientRect().width > 0,
      )
      if (!panel) return null
      panel.setAttribute('data-check-panel', '')
      const root = panel.closest('.modal') ?? panel.closest('dialog') ?? panel
      root.setAttribute('data-check-root', '')
      const r = panel.getBoundingClientRect()
      const c = getComputedStyle(panel)
      const dim = root === panel ? getComputedStyle(panel, '::backdrop') : getComputedStyle(root)
      return {
        rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width },
        look: ['background-color', 'padding-top', 'border-top-left-radius', 'box-shadow'].map((p) =>
          c.getPropertyValue(p),
        ),
        dim: dim.backgroundColor,
      }
    })
    expect(dialog, `${at}: the pay dialog opens`)
    if (dialog) {
      const { rect } = dialog
      expect(
        Math.abs((rect.left + rect.right) / 2 - width / 2) <= 2 &&
          Math.abs((rect.top + rect.bottom) / 2 - 360) <= 2,
        `${at}: the pay dialog is centred in the viewport (${Math.round(rect.left)},${Math.round(rect.top)} to ${Math.round(rect.right)},${Math.round(rect.bottom)})`,
      )
      expect(
        Math.abs(rect.width - Math.min(420, width - 32)) <= 1,
        `${at}: the pay dialog is ${rect.width}px wide (expected ${Math.min(420, width - 32)})`,
      )
      expect(
        JSON.stringify(dialog.look) === JSON.stringify(panelBefore),
        `${at}: the pay dialog looks as before (${dialog.look})`,
      )
      const alpha = /rgba?\(([^)]+)\)/
        .exec(dialog.dim)?.[1]
        .split(/[\s,/]+/)
        .filter(Boolean)
      expect(
        alpha && (alpha.length < 4 || Number(alpha[3]) >= 0.4),
        `${at}: the backdrop dims the page (${dialog.dim})`,
      )
      const bad = await misses(
        after,
        '[data-check-root]',
        { left: 0, top: 0, right: width, bottom: 720 },
        { left: 0, top: 0, right: width, bottom: 720 },
      )
      expect(
        bad.length === 0,
        `${at}: the page shows above the pay dialog at ${bad.slice(0, 4).join('; ')}`,
      )
      await after.evaluate(() => document.querySelector('[data-check-panel] [data-close]').click())
      const closed = await after.evaluate(
        () => document.querySelector('[data-check-panel]').getBoundingClientRect().width === 0,
      )
      expect(closed, `${at}: Cancel closes the pay dialog`)
    }
    await after.close()
  }
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, 12).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
