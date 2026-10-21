// Hidden acceptance for the woodshop booking page: rendered in Chromium at 1280px and 390px wide,
// in the light theme, the dark theme from the toggle and the dark theme from the system setting.
// The light theme and the toggled dark theme look exactly as they did at rest, and the system dark
// theme looks the same as the toggled one. Then, with a slot picked, every stop reached with the Tab
// key shows a focus ring at least 2px thick on all four sides, with at least 3:1 contrast against
// what was there before; the hidden checkbox shows its ring round the drawn box or its label.
/* global document, getComputedStyle, Image, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  color-scheme: light;
  --bg: #fbf7ef;
  --surface: #ffffff;
  --ink: #2b2118;
  --muted: #6b5d4f;
  --accent: #9c4a12;
  --on-accent: #ffffff;
  --line: #e3d8c8;
  --slot-bg: #f3ead9;
  --slot-ink: #3d2c1c;
  --slot-picked: #9c4a12;
  --focus: var(--accent);
  --radius: 10px;
}

/* Dark theme, from the toggle in the header. */
[data-theme='dark'] {
  color-scheme: dark;
  --bg: #1b1611;
  --surface: #261f18;
  --ink: #f1e8dc;
  --muted: #bcae9c;
  --accent: #b5591a;
  --on-accent: #ffffff;
  --line: #43372b;
  --slot-bg: #33291f;
  --slot-ink: #f1e8dc;
  --slot-picked: #b5591a;
  --focus: #9c4a12;
}

/* Dark theme, from the system setting when the toggle hasn't been used. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    color-scheme: dark;
    --bg: #1b1611;
    --surface: #261f18;
    --ink: #f1e8dc;
    --muted: #bcae9c;
    --accent: #b5591a;
    --on-accent: #ffffff;
    --line: #43372b;
    --slot-bg: #33291f;
    --slot-picked: #b5591a;
    --focus: #9c4a12;
  }
}

* {
  box-sizing: border-box;
}

:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Gill Sans', 'Trebuchet MS', sans-serif;
  line-height: 1.5;
}

a {
  color: var(--accent);
}

/* Header */

.site-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 24px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}

.brand {
  margin-right: auto;
  color: var(--ink);
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 18px;
}

.nav a {
  color: var(--ink);
  text-decoration: none;
}

.theme-toggle {
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  font-size: 0.9rem;
}

/* Page */

.page {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

h1 {
  margin: 0 0 8px;
  font-size: 1.9rem;
}

.intro {
  margin: 0 0 24px;
  color: var(--muted);
}

.booking {
  display: grid;
  gap: 18px;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--surface);
}

.group {
  margin: 0;
  padding: 0;
  border: 0;
}

.group legend {
  margin-bottom: 8px;
  padding: 0;
  font-weight: 700;
}

/* The slots read as one segmented block with hairlines between them. */
.slots {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--line);
}

.slot {
  padding: 12px 6px;
  border: 0;
  background: var(--slot-bg);
  color: var(--slot-ink);
  font: inherit;
  font-weight: 600;
}

.slot[aria-pressed='true'] {
  background: var(--slot-picked);
  color: var(--on-accent);
}

.slot:disabled {
  color: var(--muted);
  text-decoration: line-through;
}

.slot span {
  font-size: 0.8rem;
  font-weight: 400;
}

.field {
  display: grid;
  gap: 4px;
}

.field label {
  font-weight: 600;
}

.field input,
.field select {
  padding: 9px 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg);
  color: var(--ink);
  font: inherit;
}

/* Checkbox: the real input is hidden and the box is drawn instead. */
.check {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.check__box {
  flex: none;
  width: 22px;
  height: 22px;
  border: 2px solid var(--muted);
  border-radius: 5px;
  background: var(--bg);
}

.check input:checked + .check__box {
  border-color: var(--accent);
  background: var(--accent);
  box-shadow: inset 0 0 0 3px var(--surface);
}

.btn {
  justify-self: start;
  padding: 11px 20px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 700;
  outline: none;
}

.btn:hover {
  filter: brightness(1.08);
}

.bring {
  margin-top: 28px;
}

.bring h2 {
  margin: 0 0 6px;
  font-size: 1.2rem;
}

.site-footer {
  padding: 24px 16px 40px;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 480px) {
  .slots {
    grid-template-columns: repeat(2, 1fr);
  }

  .btn {
    justify-self: stretch;
  }
}
`
const PROPS = [
  'color',
  'background-color',
  'border-top-color',
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
const helper = await browser.newPage()

// mode: light, toggle (dark from the toggle), system (dark from the system setting).
async function open(width, mode, original) {
  const page = await browser.newPage({
    viewport: { width, height: 720 },
    colorScheme: mode === 'system' ? 'dark' : 'light',
  })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.goto(url)
  await page.waitForLoadState('load')
  if (mode === 'toggle') await page.evaluate(() => document.querySelector('.theme-toggle').click())
  await page.mouse.move(width - 2, 718)
  await page.evaluate(() => document.activeElement?.blur())
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
    out.body = { rect: [], style: { background: getComputedStyle(document.body).backgroundColor } }
    return out
  }, PROPS)

const compare = (was, now, at, rects = true) => {
  for (const [key, b] of Object.entries(was)) {
    const a = now[key]
    if (!a) {
      expect(!b.rect.length || (b.rect[2] === 0 && b.rect[3] === 0), `${at}: ${key} is gone`)
      continue
    }
    if (rects && b.rect.length)
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

// Decode a PNG in the helper page into RGBA rows.
const decode = (png, name) =>
  helper.evaluate(
    async ([b64, name]) => {
      const img = new Image()
      img.src = `data:image/png;base64,${b64}`
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      window[name] = ctx.getImageData(0, 0, img.width, img.height)
      return [img.width, img.height]
    },
    [png.toString('base64'), name],
  )

// Per side of `box` (document coordinates), the share of positions along it where a run of at least
// two pixels within 7px of the edge changed to a colour at least 3:1 against the colour there before.
const ringCoverage = (box) =>
  helper.evaluate((box) => {
    const base = window.base
    const now = window.now
    const lum = (d, i) => {
      const c = [d[i], d[i + 1], d[i + 2]].map((v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      })
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    }
    const contrast = (x, y) => {
      x = Math.round(x)
      y = Math.round(y)
      if (x < 0 || y < 0 || x >= base.width || y >= base.height) return 1
      const i = (y * base.width + x) * 4
      const [a, b] = [lum(base.data, i), lum(now.data, i)]
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    }
    const side = (from, to, at) => {
      let ok = 0
      let n = 0
      for (let t = from; t <= to; t += 2) {
        n += 1
        // A 2px ring off the pixel grid smears over three pixels, so ask for one pixel at 3:1
        // inside a run of at least two that clearly changed.
        let run = 0
        let strong = false
        let found = false
        for (let d = -7; d <= 7; d += 1) {
          const c = at(t, d)
          if (c >= 1.8) {
            run += 1
            strong ||= c >= 3
          } else {
            run = 0
            strong = false
          }
          if (run >= 2 && strong) found = true
        }
        if (found) ok += 1
      }
      return n ? ok / n : 0
    }
    const { left, top, right, bottom } = box
    const inset = Math.min(8, (right - left) / 4, (bottom - top) / 4)
    return {
      top: side(left + inset, right - inset, (x, d) => contrast(x, top + d)),
      bottom: side(left + inset, right - inset, (x, d) => contrast(x, bottom - 1 - d)),
      left: side(top + inset, bottom - inset, (y, d) => contrast(left + d, y)),
      right: side(top + inset, bottom - inset, (y, d) => contrast(right - 1 - d, y)),
    }
  }, box)

const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

try {
  for (const width of [1280, 390]) {
    // The themes at rest.
    const light = await open(width, 'light', false)
    compare(
      await snapshot(await open(width, 'light', true)),
      await snapshot(light),
      `at ${width}px light`,
    )
    const toggled = await snapshot(await open(width, 'toggle', false))
    compare(
      await snapshot(await open(width, 'toggle', true)),
      toggled,
      `at ${width}px toggled dark`,
    )
    compare(
      toggled,
      await snapshot(await open(width, 'system', false)),
      `at ${width}px system dark`,
    )
    const overridden = await open(width, 'system', false)
    await overridden.evaluate(() => {
      document.documentElement.dataset.theme = 'light'
    })
    compare(
      await snapshot(light),
      await snapshot(overridden),
      `at ${width}px light over system dark`,
    )
    for (const p of browser.contexts().flatMap((c) => c.pages())) if (p !== helper) await p.close()

    for (const mode of ['light', 'toggle', 'system']) {
      const at = `at ${width}px ${mode === 'light' ? 'light' : mode === 'toggle' ? 'toggled dark' : 'system dark'}`
      const page = await open(width, mode, false)
      await page.evaluate(() => document.querySelector('.slot:nth-child(2)').click())
      await page.waitForTimeout(100)
      const [w, h] = await decode(await page.screenshot({ fullPage: true }), 'base')

      // Walk the page with Tab, checking each stop for a ring.
      const seen = []
      for (let step = 0; step < 30; step += 1) {
        await page.keyboard.press('Tab')
        await page.waitForTimeout(60)
        const stop = await page.evaluate(() => {
          const el = document.activeElement
          if (!el || el === document.body) return null
          const box = (node) => {
            const r = node.getBoundingClientRect()
            return {
              left: r.left + window.scrollX,
              top: r.top + window.scrollY,
              right: r.right + window.scrollX,
              bottom: r.bottom + window.scrollY,
            }
          }
          const tiny = el.getBoundingClientRect().width < 4
          const label = el.closest('label') ?? el.labels?.[0]
          const boxes = tiny
            ? [label?.querySelector('.check__box'), label].filter(Boolean).map(box)
            : [box(el)]
          return {
            name: `${el.tagName.toLowerCase()}${el.className ? `.${el.className}` : ''} "${(el.id || el.name || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 20)}"`,
            boxes,
          }
        })
        if (!stop || seen.includes(stop.name)) break
        seen.push(stop.name)
        const [w2, h2] = await decode(await page.screenshot({ fullPage: true }), 'now')
        if (w2 !== w || h2 !== h) {
          expect(false, `${at}: focusing ${stop.name} changes the page size`)
          continue
        }
        let best = null
        for (const box of stop.boxes) {
          const cover = await ringCoverage(box)
          const worst = Math.min(...Object.values(cover))
          if (!best || worst > best.worst) best = { worst, cover }
        }
        const missing = Object.entries(best.cover)
          .filter(([, v]) => v < 0.75)
          .map(([k, v]) => `${k} ${Math.round(v * 100)}%`)
        expect(
          missing.length === 0,
          `${at}: ${stop.name} has no clear focus ring on ${missing.join(', ')}`,
        )
      }
      expect(seen.length >= 14, `${at}: only ${seen.length} tab stops (${seen.join(', ')})`)
      await page.close()
    }
  }
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, Number(process.env.CHECK_SHOW ?? 14)).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
