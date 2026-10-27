// Hidden acceptance for the hostel rooms: rendered in Chromium at 320, 360, 375 and 390px, the page
// has no sideways scroll, nothing is clipped or hidden, every card sits inside the gutters, the
// long room name wraps inside its card in full, prices and amenity chips each stay on one line
// inside the card, and the rest of each card looks as before. At 1024 and 1280px every element
// renders exactly as the original stylesheet did, and the tokens are unchanged.
/* global document, getComputedStyle, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #f6f4ef;
  --card: #ffffff;
  --ink: #1f2328;
  --muted: #5d6670;
  --accent: #0f6b5c;
  --on-accent: #ffffff;
  --chip: #e3efe9;
  --gutter: 16px;
  --radius: 10px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.45;
}

.site-header {
  padding: 16px var(--gutter);
  background: var(--accent);
  color: var(--on-accent);
}

.site-header h1 {
  margin: 0;
  font-size: 1.25rem;
}

main {
  padding: 24px var(--gutter);
}

.rooms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.room {
  padding: 16px;
  border-radius: var(--radius);
  background: var(--card);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}

.room__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.room__name {
  margin: 0;
  font-size: 1.1rem;
}

.room__price {
  color: var(--accent);
  font-weight: 700;
  white-space: nowrap;
}

.room__beds {
  margin: 4px 0 12px;
  color: var(--muted);
  font-size: 0.9rem;
}

.amenities {
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.amenities li {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--chip);
  font-size: 0.8rem;
  white-space: nowrap;
}

.book {
  display: inline-block;
  margin-top: 12px;
  padding: 8px 14px;
  border-radius: 6px;
  background: var(--accent);
  color: var(--on-accent);
  text-decoration: none;
  font-weight: 600;
}
`
const PROPS = [
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'border-top-left-radius',
  'box-shadow',
  'text-decoration-line',
  'gap',
]
const TOKENS = {
  '--bg': '#f6f4ef',
  '--card': '#ffffff',
  '--ink': '#1f2328',
  '--muted': '#5d6670',
  '--accent': '#0f6b5c',
  '--on-accent': '#ffffff',
  '--chip': '#e3efe9',
  '--gutter': '16px',
  '--radius': '10px',
}

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})

async function render(width, original) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.goto(url)
  const seen = await page.evaluate(
    ([props, tokens]) => {
      const box = (r) => ({
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      })
      const textRects = (el) => {
        const range = document.createRange()
        range.selectNodeContents(el)
        return [...range.getClientRects()].filter((r) => r.width > 0).map(box)
      }
      const elements = [...document.body.querySelectorAll('*')]
      const root = getComputedStyle(document.documentElement)
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        elements: elements.map((el) => {
          const c = getComputedStyle(el)
          return {
            path: `${el.tagName.toLowerCase()}.${el.className}:${elements.indexOf(el)}`,
            rect: box(el.getBoundingClientRect()),
            style: Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)])),
            overflow: [c.overflowX, c.overflowY, c.textOverflow, c.visibility, c.display],
          }
        }),
        rootOverflow: [
          getComputedStyle(document.documentElement).overflowX,
          getComputedStyle(document.body).overflowX,
        ],
        rooms: [...document.querySelectorAll('.room')].map((room) => ({
          rect: box(room.getBoundingClientRect()),
          name: textRects(room.querySelector('.room__name')),
          nameText: room.querySelector('.room__name').textContent.trim(),
          price: textRects(room.querySelector('.room__price')),
          parts: [...room.querySelectorAll('*')].map((el) => ({
            what: `${el.tagName.toLowerCase()}.${el.className} "${el.textContent.trim().slice(0, 20)}"`,
            rect: box(el.getBoundingClientRect()),
            text: textRects(el),
          })),
          chips: [...room.querySelectorAll('.amenities li')].map((li) => ({
            text: li.textContent.trim(),
            rect: box(li.getBoundingClientRect()),
            lines: new Set(textRects(li).map((r) => Math.round(r.top))).size,
          })),
        })),
        tokens: Object.fromEntries(tokens.map((t) => [t, root.getPropertyValue(t).trim()])),
      }
    },
    [PROPS, Object.keys(TOKENS)],
  )
  await page.close()
  return seen
}

const close = (a, b) => Math.abs(a - b) <= 0.5
try {
  for (const width of [1024, 1280]) {
    const at = `at ${width}px`
    const [before, after] = [await render(width, true), await render(width, false)]
    assert.equal(after.elements.length, before.elements.length, `${at}: same elements`)
    before.elements.forEach((b, i) => {
      const a = after.elements[i]
      for (const k of ['left', 'top', 'width', 'height'])
        assert.ok(
          close(a.rect[k], b.rect[k]),
          `${at}: ${b.path} ${k} ${a.rect[k]} was ${b.rect[k]}`,
        )
      assert.deepEqual(a.style, b.style, `${at}: ${b.path} styles unchanged`)
    })
    for (const [token, value] of Object.entries(TOKENS))
      assert.equal(after.tokens[token].toLowerCase(), value, `${at}: token ${token} unchanged`)
  }
  for (const width of [320, 360, 375, 390]) {
    const at = `at ${width}px`
    const [before, seen] = [await render(width, true), await render(width, false)]
    assert.ok(
      seen.scrollWidth <= seen.innerWidth,
      `${at}: no sideways scroll (${seen.scrollWidth}px wide)`,
    )
    for (const value of seen.rootOverflow)
      assert.equal(value, 'visible', `${at}: overflow is not hidden on the page`)
    for (const el of seen.elements) {
      assert.equal(el.overflow[0], 'visible', `${at}: ${el.path} does not clip or scroll sideways`)
      assert.equal(el.overflow[1], 'visible', `${at}: ${el.path} does not clip or scroll`)
      assert.equal(el.overflow[2], 'clip', `${at}: ${el.path} has no ellipsis`)
      assert.notEqual(el.overflow[3], 'hidden', `${at}: ${el.path} is not hidden`)
      assert.notEqual(el.overflow[4], 'none', `${at}: ${el.path} is not removed`)
    }
    assert.deepEqual(
      seen.rooms.map((r) => [r.nameText, r.chips.length]),
      [
        ['Doppelzimmer', 4],
        ['Gemeinschaftsschlafsaal', 5],
        ['Familienzimmer', 4],
        ['Frauenschlafsaal', 5],
      ],
      `${at}: every room name and amenity is still listed`,
    )
    for (const room of seen.rooms) {
      const name = room.nameText
      assert.ok(
        room.rect.left >= 16 - 0.5 && room.rect.right <= width - 16 + 0.5,
        `${at}: ${name} card sits inside the gutters`,
      )
      assert.ok(close(room.rect.width, width - 32), `${at}: ${name} card fills the column`)
      const inner = { left: room.rect.left + 16 - 0.5, right: room.rect.right - 16 + 0.5 }
      const inside = (r) => r.left >= inner.left && r.right <= inner.right
      for (const part of room.parts) {
        assert.ok(inside(part.rect), `${at}: ${part.what} in ${name} stays inside the card`)
        for (const r of part.text) {
          assert.ok(inside(r), `${at}: text of ${part.what} in ${name} stays inside the card`)
          assert.ok(
            r.left >= part.rect.left - 0.5 && r.right <= part.rect.right + 0.5,
            `${at}: text of ${part.what} in ${name} stays inside its own box`,
          )
        }
      }
      assert.ok(room.name.length > 0, `${at}: ${name} is shown`)
      assert.equal(
        new Set(room.price.map((r) => Math.round(r.top))).size,
        1,
        `${at}: price of ${name} stays on one line`,
      )
      for (const chip of room.chips)
        assert.equal(chip.lines, 1, `${at}: chip "${chip.text}" in ${name} stays on one line`)
    }
    // Apart from layout, each element looks as it did.
    before.elements.forEach((b, i) =>
      assert.deepEqual(seen.elements[i].style, b.style, `${at}: ${b.path} styles unchanged`),
    )
  }
} finally {
  await browser.close()
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
