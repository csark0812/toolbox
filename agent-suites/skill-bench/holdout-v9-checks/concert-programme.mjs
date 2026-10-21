// Hidden acceptance for the concert programme: rendered in Chromium with the system in light and
// in dark mode, and the theme switch on System, Light and Dark, every element looks exactly as the
// original page did in its matching system mode (light for Light, dark for Dark, the system's for
// System): the page background, text, cards, muted notes, rules, header, links and color-scheme
// included, at a phone and a desktop width. The dark text reaches 4.5:1 and theme.js keeps
// setting data-theme on <html>.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

// The stylesheet as it was before the change; its system light and dark renderings were right.
const ORIGINAL_CSS = `:root {
  --bg: #fbfaf7;
  --surface: #ffffff;
  --ink: #1d1b19;
  --muted: #5f5a53;
  --accent: #8a1c2b;
  --rule: #d8d2c8;
  --header-bg: #fbfaf7;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #16161a;
    --surface: #202027;
    --ink: #ecebe7;
    --muted: #aaa59c;
    --accent: #f08c98;
    --rule: #3a3a42;
    --header-bg: #1b1b20;
    color-scheme: dark;
  }
}

[data-theme='dark'] body {
  --bg: #16161a;
  --surface: #202027;
  --ink: #ecebe7;
  --accent: #f08c98;
  --rule: #3a3a42;
  --header-bg: #1b1b20;
  color-scheme: dark;
}

html {
  background: var(--bg);
  color: var(--ink);
}

body {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  line-height: 1.55;
}

.site-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--rule);
  background: var(--header-bg);
}

.site-header .name {
  font-weight: 700;
}

.site-header select {
  font: inherit;
}

main {
  max-width: 42rem;
  margin: 0 auto;
  padding: 24px 16px 48px;
}

h1 {
  margin: 0 0 4px;
  color: var(--accent);
  font-size: 2rem;
}

.when {
  margin: 0 0 24px;
  color: var(--muted);
}

.work {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--surface);
}

.work h2 {
  margin: 0;
  font-size: 1.2rem;
}

.composer {
  margin: 2px 0 8px;
  color: var(--muted);
  font-variant: small-caps;
}

.note {
  margin: 0;
  font-style: italic;
  color: var(--muted);
}

.interval {
  margin: 24px 0;
  padding: 8px 0;
  border-block: 1px dashed var(--rule);
  text-align: center;
  color: var(--muted);
}

a {
  color: var(--accent);
}
`
const PROPS = [
  'background-color',
  'color',
  'color-scheme',
  'border-top-color',
  'border-bottom-color',
  'border-top-width',
  'border-bottom-width',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-variant-caps',
  'line-height',
  'padding-top',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'border-top-left-radius',
  'position',
  'top',
  'text-align',
]
const TOKENS = ['--bg', '--surface', '--ink', '--muted', '--accent', '--rule', '--header-bg']

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
assert.match(
  readFileSync(join(dir, 'theme.js'), 'utf8'),
  /document\.documentElement\.dataset\.theme = choice/,
  'theme.js still sets data-theme on <html>',
)
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})

async function render(width, scheme, theme, original) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme })
  if (original)
    await page.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
  await page.goto(url)
  const seen = await page.evaluate(
    ([props, tokens, theme]) => {
      if (theme) document.documentElement.dataset.theme = theme
      else delete document.documentElement.dataset.theme
      const elements = [
        document.documentElement,
        document.body,
        ...document.body.querySelectorAll('*'),
      ]
      const root = getComputedStyle(document.documentElement)
      return {
        tokens: Object.fromEntries(
          tokens.map((t) => [t, root.getPropertyValue(t).trim().toLowerCase()]),
        ),
        elements: elements.map((el, i) => {
          const c = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          return {
            path: `${el.tagName.toLowerCase()}${el.className ? '.' + el.className : ''}:${i}`,
            rect: [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 2) / 2),
            style: Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)])),
          }
        }),
      }
    },
    [PROPS, TOKENS, theme],
  )
  await page.close()
  return seen
}

const rgb = (text) =>
  text
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
const luminance = (c) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [x, y] = [luminance(rgb(a)), luminance(rgb(b))].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

try {
  for (const width of [390, 1280]) {
    const expected = {
      light: await render(width, 'light', null, true),
      dark: await render(width, 'dark', null, true),
    }
    assert.equal(expected.dark.tokens['--bg'], '#16161a', 'original dark rendering is dark')
    for (const scheme of ['light', 'dark'])
      for (const theme of [null, 'light', 'dark']) {
        const want = theme ?? scheme
        const at = `at ${width}px, system ${scheme}, switch ${theme ?? 'system'}`
        const seen = await render(width, scheme, theme, false)
        assert.deepEqual(
          seen.tokens,
          expected[want].tokens,
          `${at}: tokens on <html> are the ${want} set`,
        )
        assert.equal(seen.elements.length, expected[want].elements.length, `${at}: same elements`)
        expected[want].elements.forEach((b, i) => {
          const a = seen.elements[i]
          assert.deepEqual(a.style, b.style, `${at}: ${b.path} looks as in ${want} mode`)
          assert.deepEqual(a.rect, b.rect, `${at}: ${b.path} is laid out as before`)
        })
        if (want === 'dark') {
          const byClass = (cls) => seen.elements.find((e) => e.path.startsWith(cls)).style
          const surface = byClass('article.work')['background-color']
          for (const cls of ['p.note', 'p.composer', 'h2'])
            assert.ok(
              contrast(byClass(cls).color, surface) >= 4.5,
              `${at}: ${cls} readable on a card`,
            )
        }
      }
  }
} finally {
  await browser.close()
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
