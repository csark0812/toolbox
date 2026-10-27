// Hidden acceptance for the eisteddfod entry form: in English at rest, at 1024px and 390px, it
// looks exactly as before. In English and Welsh, at 1024px, 390px and 320px, before and after Send
// is pressed on the empty form: no text box (labels, hints, errors, buttons, headings) is clipped
// or overflows; labels, fields, hints, errors and buttons never overlap; labels sit left of their
// field above 600px and above it below; each error sits under its own field; nothing runs off the
// page or the form. index.html and app.js are unchanged.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #f7f4ee;
  --surface: #ffffff;
  --ink: #1f2430;
  --muted: #5b6070;
  --brand: #8a1c2b;
  --on-brand: #ffffff;
  --line: #cfc8bb;
  --error: #b3261e;
  --control-h: 44px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Gill Sans', 'Trebuchet MS', sans-serif;
  font-size: 16px;
  line-height: 1.5;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  background: var(--brand);
  color: var(--on-brand);
}

.brand {
  font-size: 1.15rem;
  font-weight: 700;
}

.lang {
  display: flex;
  gap: 4px;
}

.lang button {
  padding: 4px 10px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 999px;
  background: transparent;
  color: var(--on-brand);
  font: inherit;
  font-size: 0.85rem;
}

.lang button[aria-pressed='true'] {
  background: var(--on-brand);
  color: var(--brand);
}

.page {
  max-width: 680px;
  margin: 0 auto;
  padding: 28px 16px 48px;
}

h1 {
  margin: 0 0 8px;
  font-size: 1.9rem;
  line-height: 1.2;
}

.intro {
  margin: 0 0 24px;
  color: var(--muted);
}

.entry-form {
  padding: 24px;
  border-radius: 12px;
  background: var(--surface);
}

/* Each field: the label on the left, lined up with the middle of the box on the right. */
.field {
  display: grid;
  grid-template-columns: 170px 1fr;
  column-gap: 16px;
  align-items: start;
  margin-bottom: 22px;
}

.field label {
  height: var(--control-h);
  overflow: hidden;
  font-weight: 700;
  line-height: var(--control-h);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field__control {
  position: relative;
  min-width: 0;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  height: var(--control-h);
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--surface);
  color: var(--ink);
  font: inherit;
}

.field textarea {
  height: auto;
  padding: 10px 12px;
  resize: vertical;
}

.field [aria-invalid] {
  border-color: var(--error);
}

.hint {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Errors tuck in under the field so the form doesn't jump. */
.error {
  position: absolute;
  top: 100%;
  left: 0;
  margin: 2px 0 0;
  color: var(--error);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.4;
}

.money {
  display: flex;
  width: 160px;
}

.money__prefix {
  display: grid;
  place-items: center;
  width: 40px;
  border: 1px solid var(--line);
  border-right: 0;
  border-radius: 8px 0 0 8px;
  background: var(--bg);
  font-weight: 700;
}

.money input {
  border-radius: 0 8px 8px 0;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 28px;
  padding-left: 186px;
}

.btn {
  width: 150px;
  height: var(--control-h);
  overflow: hidden;
  border: 2px solid var(--brand);
  border-radius: 8px;
  background: var(--surface);
  color: var(--brand);
  font: inherit;
  font-weight: 700;
  white-space: nowrap;
}

.btn--primary {
  background: var(--brand);
  color: var(--on-brand);
}

@media (max-width: 600px) {
  .entry-form {
    padding: 18px 16px;
  }

  .field {
    grid-template-columns: 1fr;
    margin-bottom: 18px;
  }

  .actions {
    padding-left: 0;
  }
}
`
const FROZEN = {
  'index.html': '6de55c08f1b73f4e41b81b9fdcb436ccf198a7220481c933a60406304187a70c',
  'app.js': '0d4bcb02c99cf8b885b24cc0a849ff2272ad9d24a5440496a6095c41cac26c48',
}

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}

// The words and the markup come from elsewhere, so they stay as they were.
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

async function open(width, lang, original) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.goto(url)
  await page.waitForLoadState('load')
  if (lang === 'cy') await page.click('.lang button[data-lang="cy"]')
  await page.mouse.move(width - 2, 898)
  await page.evaluate(() => document.activeElement?.blur())
  return page
}

const PROPS = [
  'color',
  'background-color',
  'font-size',
  'font-weight',
  'text-align',
  'border-top-width',
  'border-top-left-radius',
]

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
      // Where the element's own words sit, so text moved inside an unchanged box still counts.
      const words = [...el.childNodes].filter((t) => t.nodeType === 3 && t.textContent.trim())
      const range = document.createRange()
      const text = words.flatMap((t) => {
        range.selectNodeContents(t)
        const q = range.getBoundingClientRect()
        return [q.left, q.top, q.width, q.height]
      })
      out[`${base}#${n}`] = {
        rect: [r.left, r.top, r.width, r.height, ...text].map((v) => Math.round(v * 2) / 2),
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
      a.rect.length === b.rect.length && a.rect.every((v, i) => Math.abs(v - b.rect[i]) <= 1),
      `${at}: ${key} is at ${a.rect} (was ${b.rect})`,
    )
    for (const p of Object.keys(b.style))
      expect(
        a.style[p] === b.style[p],
        `${at}: ${key} ${p} is ${a.style[p]} (expected ${b.style[p]})`,
      )
  }
}

// Everything the form promises, measured on the page as it stands.
const measure = (page, width) =>
  page.evaluate((W) => {
    const out = []
    const say = (m) => out.push(m)
    const shown = (el) => {
      if (!el || el.hidden) return false
      const c = getComputedStyle(el)
      if (c.display === 'none' || c.visibility !== 'visible') return false
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    }
    const name = (el) =>
      `${el.tagName.toLowerCase()}${el.className ? `.${String(el.className).split(' ')[0]}` : ''} "${(el.textContent || el.id).trim().replace(/\s+/g, ' ').slice(0, 28)}"`
    const box = (el) => el.getBoundingClientRect()

    if (document.documentElement.scrollWidth > W + 1)
      say(`the page scrolls sideways (${document.documentElement.scrollWidth}px wide)`)
    const form = box(document.querySelector('.entry-form'))
    for (const el of document.querySelectorAll('body *')) {
      if (!shown(el) || el.tagName === 'OPTION') continue
      const r = box(el)
      if (r.right > W + 1 || r.left < -1) say(`${name(el)} runs off the page`)
      if (el.closest('.entry-form') && (r.right > form.right + 1 || r.left < form.left - 1))
        say(`${name(el)} runs out of the form`)
    }

    // Text shows in full.
    const texts = document.querySelectorAll(
      '.brand, .lang button, h1, .intro, .field label, .hint, .error, .btn, .money__prefix',
    )
    for (const el of texts) {
      if (!shown(el)) continue
      if (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
        say(`${name(el)} is cut off or spills out of its box`)
      if (getComputedStyle(el).textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth)
        say(`${name(el)} is shortened with an ellipsis`)
    }

    // Nothing overlaps.
    const parts = [
      ...document.querySelectorAll(
        '.field label, .field input, .field select, .field textarea, .money__prefix, .hint, .error, .btn',
      ),
    ].filter(shown)
    for (let i = 0; i < parts.length; i += 1)
      for (let j = i + 1; j < parts.length; j += 1) {
        const a = box(parts[i])
        const b = box(parts[j])
        const x = Math.min(a.right, b.right) - Math.max(a.left, b.left)
        const y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
        if (x > 1 && y > 1) say(`${name(parts[i])} overlaps ${name(parts[j])}`)
      }

    // Labels beside their fields on wide screens, above them on phones; errors under their own field.
    for (const field of document.querySelectorAll('.field')) {
      const label = field.querySelector('label')
      const control = document.getElementById(label.htmlFor)
      const c = box(control.closest('.money') ?? control)
      const l = box(label)
      if (W > 600) {
        if (!(l.right <= c.left + 1 && l.top < c.bottom && l.bottom > c.top))
          say(`${name(label)} is not beside its field`)
      } else if (!(l.bottom <= c.top + 1)) say(`${name(label)} is not above its field`)
      const error = field.querySelector('.error')
      if (shown(error)) {
        const e = box(error)
        if (e.top < c.bottom - 1 || e.left < c.left - 1)
          say(`${name(error)} is not under its own field`)
      }
    }
    return out
  }, width)

try {
  for (const width of [1024, 390])
    compare(
      await snapshot(await open(width, 'en', true)),
      await snapshot(await open(width, 'en', false)),
      `in English at ${width}px`,
    )

  for (const lang of ['en', 'cy'])
    for (const width of [1024, 390, 320]) {
      const page = await open(width, lang, false)
      for (const m of await measure(page, width)) expect(false, `${lang} at ${width}px: ${m}`)
      await page.click('.btn--primary')
      await page.waitForTimeout(50)
      const errors = await page.locator('.error:not([hidden])').count()
      expect(errors === 3, `${lang} at ${width}px: ${errors} error messages show after Send`)
      await page.evaluate(() => document.activeElement?.blur())
      for (const m of await measure(page, width))
        expect(false, `${lang} at ${width}px after Send: ${m}`)
      await page.close()
    }
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, Number(process.env.CHECK_SHOW ?? 14)).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
