// Hidden acceptance for the regatta programme: rendered in Chromium at 1280px and 390px wide, the
// page at rest looks exactly as it did and the Finals ribbon is still clipped to its card. Scrolled
// into each session, that session's heading is pinned flush under the sticky header, in full view,
// with no race badge painting over it; as the session ends its heading slides under the header,
// never over it. Each jump link in the header lands with the target heading in full view just
// under the header, and the session's first race in full view under its heading.
/* global document, getComputedStyle, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #eef3f6;
  --surface: #ffffff;
  --ink: #102a3a;
  --muted: #557080;
  --accent: #0d4f6e;
  --on-accent: #ffffff;
  --live: #c8361d;
  --next: #e7a91b;
  --done: #c9d6de;
  --line: #dde6eb;
  --radius: 12px;
  /* height of the sticky header */
  --header-h: 64px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.4;
}

/* Header */

.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: var(--header-h);
  padding: 0 20px;
  background: var(--accent);
  color: var(--on-accent);
}

.brand {
  color: inherit;
  font-size: 1.2rem;
  font-weight: 700;
  text-decoration: none;
}

.jump {
  display: flex;
  gap: 18px;
}

.jump a {
  color: inherit;
  text-decoration: none;
}

.hero {
  max-width: 820px;
  margin: 0 auto;
  padding: 40px 16px 24px;
}

.hero h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.hero p {
  margin: 0;
  color: var(--muted);
}

/* Sessions */

.programme {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 16px 48px;
}

.session {
  position: relative;
  margin-bottom: 24px;
  border-radius: var(--radius);
  background: var(--surface);
}

.session--finals {
  overflow: hidden;
}

.ribbon {
  position: absolute;
  top: 14px;
  right: -34px;
  width: 140px;
  padding: 4px 0;
  background: var(--next);
  color: var(--ink);
  font-size: 0.8rem;
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  transform: rotate(35deg);
}

.session__title {
  position: sticky;
  top: 0;
  margin: 0;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  border-radius: var(--radius) var(--radius) 0 0;
  background: var(--surface);
  font-size: 1.25rem;
}

.session__time {
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 400;
}

.races {
  margin: 0;
  padding: 0 20px 8px;
  list-style: none;
}

.race {
  display: grid;
  grid-template-columns: 4rem 1fr auto;
  grid-template-areas:
    'time event badge'
    'time crews badge';
  align-items: center;
  column-gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}

.race:last-child {
  border-bottom: 0;
}

.race__time {
  grid-area: time;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.race__event {
  grid-area: event;
  font-weight: 600;
}

.race__crews {
  grid-area: crews;
  color: var(--muted);
  font-size: 0.95rem;
}

/* The badge is its own stacking context so its pulse can sit behind the label. */
.badge {
  position: relative;
  z-index: 1;
  grid-area: badge;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--done);
  font-size: 0.8rem;
  font-weight: 700;
}

.badge--live {
  background: var(--live);
  color: var(--on-accent);
}

.badge--live::before {
  position: absolute;
  inset: -4px;
  z-index: -1;
  border-radius: inherit;
  background: var(--live);
  opacity: 0.3;
  content: '';
}

.badge--next {
  background: var(--next);
}

.prizes {
  padding: 4px 20px 12px;
  border-radius: var(--radius);
  background: var(--surface);
}

.trophies {
  margin: 0;
  padding-left: 20px;
  line-height: 1.9;
}

.site-footer {
  padding: 24px 16px 40px;
  color: var(--muted);
  text-align: center;
}

/* Phones: the jump links move onto their own row. */

@media (max-width: 600px) {
  .site-header {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 16px;
    row-gap: 6px;
  }

  .jump {
    width: 100%;
    gap: 14px;
    font-size: 0.95rem;
  }

  .jump a {
    padding: 8px 0;
  }

  .hero h1 {
    font-size: 1.6rem;
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
  'box-shadow',
  'opacity',
  'visibility',
  'transform',
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

// Points inside `selector`'s box (inset past rounded corners) whose topmost element is outside it.
const misses = (page, selector) =>
  page.evaluate((selector) => {
    const owner = document.querySelector(selector)
    const r = owner.getBoundingClientRect()
    const left = Math.max(r.left, 0) + 6
    const right = Math.min(r.right, window.innerWidth) - 6
    const top = Math.max(r.top, 0) + 3
    const bottom = Math.min(r.bottom, window.innerHeight) - 3
    const bad = []
    for (let i = 0; i <= 12; i += 1)
      for (let j = 0; j <= 4; j += 1) {
        const x = left + ((right - left) * i) / 12
        const y = top + ((bottom - top) * j) / 4
        const hit = document.elementFromPoint(x, y)
        if (!hit || !owner.contains(hit))
          bad.push(
            `${Math.round(x)},${Math.round(y)} -> ${hit ? `${hit.tagName.toLowerCase()}.${hit.className}` : 'nothing'}`,
          )
      }
    return bad
  }, selector)

const rectOf = (page, selector) =>
  page.evaluate((selector) => {
    const r = document.querySelector(selector).getBoundingClientRect()
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, height: r.height }
  }, selector)

const scrollToY = (page, y) =>
  page.evaluate((y) => {
    document.documentElement.style.scrollBehavior = 'auto'
    window.scrollTo(0, y)
    document.documentElement.style.scrollBehavior = ''
  }, y)

const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

try {
  for (const width of [1280, 390]) {
    const at = `at ${width}px`

    // At rest the page looks exactly as before.
    const before = await open(width, true)
    const page = await open(width, false)
    const [was, now] = [await snapshot(before), await snapshot(page)]
    for (const [key, b] of Object.entries(was)) {
      const a = now[key]
      if (!a) {
        expect(b.rect[2] === 0 && b.rect[3] === 0, `${at}: ${key} is gone`)
        continue
      }
      expect(
        a.rect.every((v, i) => Math.abs(v - b.rect[i]) <= 1),
        `${at}: ${key} at rest is at ${a.rect} (was ${b.rect})`,
      )
      for (const p of Object.keys(b.style))
        expect(a.style[p] === b.style[p], `${at}: ${key} ${p} is ${a.style[p]} (was ${b.style[p]})`)
    }
    await before.close()

    // The ribbon is still trimmed to the Finals card.
    const ribbonOut = await page.evaluate(() => {
      const ribbon = document.querySelector('.ribbon')
      const card = document.getElementById('finals')
      ribbon.scrollIntoView({ block: 'center' })
      const r = ribbon.getBoundingClientRect()
      const c = card.getBoundingClientRect()
      const hits = []
      for (let y = r.top + 2; y < r.bottom - 2; y += 3)
        for (let x = c.right + 1; x < r.right; x += 3) {
          const hit = document.elementFromPoint(x, y)
          if (hit && ribbon.contains(hit)) hits.push(`${Math.round(x)},${Math.round(y)}`)
        }
      return hits
    })
    expect(
      ribbonOut.length === 0,
      `${at}: the Finals ribbon shows outside its card at ${ribbonOut.slice(0, 3)}`,
    )

    const header = async () => (await rectOf(page, '.site-header')).bottom
    for (const id of ['heats', 'reps', 'finals']) {
      const title = `#${id} .session__title`
      // Part way into the session: the heading is pinned flush under the header, in full view.
      const top = await page.evaluate(
        (id) => document.getElementById(id).getBoundingClientRect().top + window.scrollY,
        id,
      )
      await scrollToY(page, 0)
      const hb = await header()
      let t
      let hNow
      for (const into of [60, 120, 180, 260]) {
        await scrollToY(page, top - hb + into)
        t = await rectOf(page, title)
        hNow = await header()
        expect(
          Math.abs(t.top - hNow) <= 1,
          `${at}: ${into}px into ${id}, its heading is at ${Math.round(t.top)}px (header ends at ${Math.round(hNow)}px)`,
        )
        const covered = await misses(page, title)
        expect(
          covered.length === 0,
          `${at}: ${into}px into ${id}, its pinned heading is covered at ${covered.slice(0, 3).join('; ')}`,
        )
        const headerCovered = await misses(page, '.site-header')
        expect(
          headerCovered.length === 0,
          `${at}: ${into}px into ${id}, the header is covered at ${headerCovered.slice(0, 3).join('; ')}`,
        )
      }

      // As the session ends, its heading goes under the header, not over it.
      const end = await page.evaluate(
        (id) => document.getElementById(id).getBoundingClientRect().bottom + window.scrollY,
        id,
      )
      await scrollToY(page, end - hNow - t.height / 2)
      const leaving = await misses(page, '.site-header')
      expect(
        leaving.length === 0,
        `${at}: leaving ${id}, its heading paints over the header at ${leaving.slice(0, 3).join('; ')}`,
      )
    }

    // Each jump link lands with the target heading in full view, just under the header.
    await scrollToY(page, 0)
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('.site-header a[href^="#"]')]
        .map((a) => a.getAttribute('href'))
        .filter((h) => h.length > 1),
    )
    expect(links.length === 4, `${at}: the header has ${links.length} jump links`)
    for (const href of links) {
      await scrollToY(page, 0)
      await page.click(`.site-header a[href="${href}"]`)
      await page.waitForTimeout(900)
      const heading = `${href} h2`
      const t = await rectOf(page, heading)
      const hb = await header()
      const atEnd = await page.evaluate(
        () =>
          Math.ceil(window.scrollY + window.innerHeight) >=
          document.documentElement.scrollHeight - 1,
      )
      expect(
        t.top >= hb - 1,
        `${at}: after jumping to ${href} its heading starts at ${Math.round(t.top)}px, under the header (${Math.round(hb)}px)`,
      )
      expect(
        atEnd || t.top <= hb + 40,
        `${at}: after jumping to ${href} its heading is ${Math.round(t.top - hb)}px below the header`,
      )
      const covered = await misses(page, heading)
      expect(
        covered.length === 0,
        `${at}: after jumping to ${href} its heading is covered at ${covered.slice(0, 3).join('; ')}`,
      )
      const hasRace = await page.evaluate((href) => !!document.querySelector(`${href} .race`), href)
      if (hasRace) {
        const race = await rectOf(page, `${href} .race`)
        expect(
          race.top >= t.bottom - 1,
          `${at}: after jumping to ${href} its first race starts at ${Math.round(race.top)}px, under its heading (${Math.round(t.bottom)}px)`,
        )
        const hidden = await misses(page, `${href} .race`)
        expect(
          hidden.length === 0,
          `${at}: after jumping to ${href} its first race is covered at ${hidden.slice(0, 3).join('; ')}`,
        )
      }
    }
    await page.close()
  }
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, 12).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
