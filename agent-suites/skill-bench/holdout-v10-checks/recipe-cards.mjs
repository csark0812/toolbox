// Hidden acceptance for the recipe cards: rendered in Chromium from 320px to 1440px wide, every card
// in the main list and in the sidebar lays itself out from its own width (photo on the left taking
// two fifths beside the text at 24rem and wider, a 4:3 photo stacked above the text below that), its
// title size follows the card's width from 1.1rem at 18rem to 1.6rem at 36rem and never the
// viewport's, the sidebar holds its cards so they stop before the newsletter, there is no sideways
// scroll, and everything else looks as the original stylesheet drew it.
/* global document, getComputedStyle, window */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #fbf7f2;
  --surface: #ffffff;
  --ink: #2b2118;
  --muted: #6f6257;
  --accent: #b5532f;
  --on-accent: #ffffff;
  --tag: #f1e6da;
  --radius: 14px;
  --shadow: 0 2px 8px rgb(43 33 24 / 0.1);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Lora', Georgia, serif;
  line-height: 1.5;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--tag);
}

.brand {
  color: var(--accent);
  font-size: 1.25rem;
  font-weight: 700;
  text-decoration: none;
}

.site-nav {
  display: flex;
  gap: 16px;
}

.site-nav a {
  color: var(--ink);
  text-decoration: none;
}

.page {
  max-width: 72rem;
  margin: 0 auto;
  padding: 24px 16px;
}

@media (min-width: 960px) {
  .page {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 18rem;
    gap: 2rem;
  }
}

h1 {
  margin: 0;
  font-size: 2rem;
  line-height: 1.2;
}

.lede {
  margin: 8px 0 24px;
  color: var(--muted);
}

/* Card lists. The lists are containers so the cards can size themselves. */

.recipes,
.more__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recipes {
  container-type: inline-size;
}

.more {
  container-type: size;
}

.more__title {
  margin: 0 0 16px;
  font-size: 1.25rem;
}

/* Recipe card */

.card {
  container: card / inline-size;
  display: grid;
  overflow: hidden;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.card__media {
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, rgb(255 255 255 / 0.25), transparent 60%), var(--photo);
}

.card__body {
  padding: 1rem 1.25rem 1.25rem;
}

.card__title {
  margin: 0;
  font-size: clamp(1.1rem, 0.6rem + 2.5vw, 1.6rem);
  line-height: 1.2;
}

.card__title a {
  color: inherit;
  text-decoration: none;
}

.card__meta {
  margin: 6px 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
}

.card__tags li {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--tag);
  font-size: 0.8rem;
}

@container card (min-width: 24rem) {
  .card {
    grid-template-columns: 2fr 3fr;
  }

  .card__media {
    aspect-ratio: auto;
  }
}

/* Newsletter and footer */

.newsletter {
  max-width: 72rem;
  margin: 0 auto;
  padding: 32px 16px;
  background: var(--tag);
  text-align: center;
}

.newsletter h2 {
  margin: 0;
}

.newsletter p {
  margin: 4px 0 16px;
  color: var(--muted);
}

.newsletter__form {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.newsletter__form input {
  width: min(280px, 100%);
  padding: 10px 12px;
  border: 1px solid #d8c8b8;
  border-radius: 8px;
  font: inherit;
}

.newsletter__form button {
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
}

.site-footer {
  padding: 24px 16px 48px;
  color: var(--muted);
  font-size: 0.9rem;
  text-align: center;
}
`
const PROPS = [
  'color',
  'background-color',
  'background-image',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'text-align',
  'text-decoration-line',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'border-top-width',
  'border-bottom-color',
  'border-top-left-radius',
  'box-shadow',
  'gap',
]
// Elements whose position does not depend on the cards, compared box for box.
const FIXED = ['.site-header', '.brand', '.site-nav', 'h1', '.lede', '.more__title']
const WIDTHS = [320, 375, 414, 600, 700, 1024, 1280, 1440]
const REM = 16

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
    ([props, fixed]) => {
      const box = (el) => {
        const r = el.getBoundingClientRect()
        return {
          left: r.left,
          right: r.right,
          top: r.top + window.scrollY,
          bottom: r.bottom + window.scrollY,
          width: r.width,
          height: r.height,
        }
      }
      const key = (el) => {
        const path = []
        for (let e = el; e && e !== document.body; e = e.parentElement)
          path.unshift(`${e.tagName.toLowerCase()}.${e.className}`)
        return `${path.join('>')}|${el.textContent.trim().slice(0, 24)}`
      }
      const seenKeys = new Map()
      const styles = {}
      for (const el of document.body.querySelectorAll('*')) {
        // The card title's size is what changes; wrappers added around the cards are not compared.
        if (el.closest('.card__title')) continue
        const k = key(el).replace(/>li\.[^>]*>(?:[a-z]+\.[^>]*>)*article\.card/, '>li>article.card')
        const n = (seenKeys.get(k) ?? 0) + 1
        seenKeys.set(k, n)
        const c = getComputedStyle(el)
        styles[`${k}#${n}`] = Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)]))
      }
      return {
        scrollWidth: document.documentElement.scrollWidth,
        styles,
        fixed: Object.fromEntries(fixed.map((s) => [s, box(document.querySelector(s))])),
        aside: box(document.querySelector('.more')),
        newsletter: box(document.querySelector('.newsletter')),
        footer: box(document.querySelector('.site-footer')),
        cards: [...document.querySelectorAll('.card')].map((card) => ({
          where: card.closest('.more') ? 'sidebar' : 'main list',
          title: card.querySelector('.card__title').textContent.trim(),
          box: box(card),
          media: box(card.querySelector('.card__media')),
          body: box(card.querySelector('.card__body')),
          titleSize: parseFloat(getComputedStyle(card.querySelector('.card__title')).fontSize),
          titleText: [card.querySelector('.card__title'), card.querySelector('.card__title a')].map(
            (el) => {
              const c = getComputedStyle(el)
              return [c.color, c.fontFamily, c.fontWeight, c.lineHeight === 'normal']
            },
          ),
        })),
      }
    },
    [PROPS, FIXED],
  )
  await page.close()
  return seen
}

const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}
const near = (a, b, tol = 1) => Math.abs(a - b) <= tol
const sizes = []

try {
  for (const width of WIDTHS) {
    const at = `at ${width}px`
    const [before, seen] = [await render(width, true), await render(width, false)]
    expect(seen.scrollWidth <= width, `${at}: no sideways scroll (${seen.scrollWidth}px)`)
    for (const s of FIXED)
      for (const k of ['left', 'top', 'width', 'height'])
        // Below 960px the sidebar follows the main list, whose height the card titles change.
        if (!(s === '.more__title' && k === 'top' && width < 960))
          expect(
            near(seen.fixed[s][k], before.fixed[s][k], 0.5),
            `${at}: ${s} ${k} is ${seen.fixed[s][k]} (was ${before.fixed[s][k]})`,
          )
    for (const [k, b] of Object.entries(before.styles)) {
      const a = seen.styles[k]
      expect(a, `${at}: ${k} is still on the page`)
      if (a)
        for (const p of Object.keys(b))
          expect(a[p] === b[p], `${at}: ${k} ${p} is ${a[p]} (was ${b[p]})`)
    }
    expect(seen.cards.length === 10, `${at}: ten cards`)
    for (const [i, card] of seen.cards.entries()) {
      const what = `${at}: ${card.where} card "${card.title}" (${Math.round(card.box.width)}px)`
      const { box, media, body } = card
      expect(
        JSON.stringify(card.titleText) === JSON.stringify(before.cards[i].titleText),
        `${what}: title colour and type unchanged`,
      )
      if (box.width >= 24 * REM) {
        expect(
          near(media.left, box.left) && near(media.top, box.top) && near(media.bottom, box.bottom),
          `${what}: photo fills the left side of the card`,
        )
        expect(
          near(media.width, box.width * 0.4, 1.5),
          `${what}: photo takes two fifths (${media.width}px)`,
        )
        expect(
          body.left >= media.right - 1 && near(body.right, box.right),
          `${what}: text sits beside the photo`,
        )
      } else {
        expect(
          near(media.left, box.left) && near(media.top, box.top) && near(media.width, box.width),
          `${what}: photo spans the top of the card`,
        )
        expect(
          near(media.height, (media.width * 3) / 4, 1.5),
          `${what}: photo is 4:3 (${media.height}px)`,
        )
        expect(body.top >= media.bottom - 1, `${what}: text sits below the photo`)
      }
      const linear = Math.min(25.6, Math.max(17.6, 9.6 + (box.width * 8) / 288))
      expect(
        near(card.titleSize, linear, 1),
        `${what}: title is ${card.titleSize}px, expected about ${linear.toFixed(1)}px for this card width`,
      )
      expect(
        card.titleSize >= 17.6 - 0.2 && card.titleSize <= 25.6 + 0.2,
        `${what}: title stays between 1.1rem and 1.6rem (${card.titleSize}px)`,
      )
      sizes.push([box.width, card.titleSize, what])
      if (card.where === 'sidebar')
        expect(
          box.bottom <= seen.aside.bottom + 1 && box.top >= seen.aside.top - 1,
          `${what}: sits inside the sidebar box`,
        )
      expect(box.bottom <= seen.newsletter.top + 0.5, `${what}: ends before the newsletter`)
    }
    expect(
      seen.newsletter.bottom <= seen.footer.top + 0.5,
      `${at}: the newsletter ends before the footer`,
    )
  }
  // The title follows the card's width: never smaller on a wider card, the same on equal cards.
  sizes.sort((a, b) => a[0] - b[0])
  for (let i = 1; i < sizes.length; i += 1) {
    const [[w0, f0, a], [w1, f1, b]] = [sizes[i - 1], sizes[i]]
    if (w1 - w0 < 1) expect(near(f0, f1, 0.3), `same card width, different title size: ${a} / ${b}`)
    else expect(f1 >= f0 - 0.3, `a wider card has a smaller title: ${a} / ${b}`)
  }
} finally {
  await browser.close()
}
assert.deepEqual([...new Set(fails)], [], [...new Set(fails)].slice(0, 12).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
