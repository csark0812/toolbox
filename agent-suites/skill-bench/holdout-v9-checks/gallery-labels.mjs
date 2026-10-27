// Hidden acceptance for the gallery labels: rendered in Chromium at a phone and a desktop width,
// the artwork titles get the label styling (italic serif, accent colour, 1.5rem, no uppercase or
// tracking, 4px gap) and the loan badges get the --badge-loan colours, while the Tessera widget's
// "Opening hours" heading, the rest of the page and every token render exactly as before. The
// vendor file stays as pasted and no !important is used.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const dir = process.argv[2]
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')
for (const file of ['styles.css', 'hours-widget.css'])
  assert.doesNotMatch(
    strip(readFileSync(join(dir, file), 'utf8')),
    /!\s*important/i,
    `no !important in ${file}`,
  )

const PROPS = [
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'text-transform',
  'letter-spacing',
  'margin-top',
  'margin-bottom',
  'padding-top',
  'padding-left',
  'border-left-color',
  'border-left-width',
]
// Computed values of the untouched parts of the page, taken from the page before the change.
const SERIF = '"Cormorant Garamond", Georgia, serif'
const SANS = 'Inter, system-ui, sans-serif'
const UNCHANGED = {
  body: {
    'background-color': 'rgb(250, 248, 244)',
    color: 'rgb(34, 32, 28)',
    'font-family': SANS,
    'line-height': '24px',
    'padding-left': '16px',
  },
  h1: {
    'font-family': SERIF,
    'font-size': '35.2px',
    color: 'rgb(122, 46, 58)',
    'margin-top': '0px',
  },
  '.visit h2': {
    'font-family': SERIF,
    'font-size': '22.4px',
    color: 'rgb(122, 46, 58)',
    'margin-top': '32px',
    'margin-bottom': '12px',
  },
  '.intro': { color: 'rgb(106, 100, 90)', 'margin-top': '8px' },
  '.label': {
    'background-color': 'rgb(255, 255, 255)',
    'border-left-color': 'rgb(122, 46, 58)',
    'border-left-width': '4px',
    'padding-top': '16px',
  },
  '.label__artist': { 'font-weight': '600', 'font-family': SANS, 'font-size': '16px' },
  '.label__meta': { color: 'rgb(106, 100, 90)', 'font-size': '14.4px', 'font-family': SANS },
  '.label__text:not(.u-muted)': {
    color: 'rgb(34, 32, 28)',
    'margin-top': '8px',
    'font-size': '16px',
  },
  '.label__text.u-muted': { color: 'rgb(106, 100, 90)' },
  '.badge': {
    'font-size': '12px',
    'font-weight': '600',
    'margin-top': '8px',
    'padding-left': '8px',
  },
  '.tessera-hours': {
    'background-color': 'rgb(255, 255, 255)',
    'padding-top': '12px',
    'padding-left': '16px',
    'font-family': SANS,
  },
  '.tessera-hours h3': {
    'font-family': 'system-ui, sans-serif',
    'font-size': '15.2px',
    'font-style': 'normal',
    'font-weight': '600',
    'line-height': '19.76px',
    color: 'rgb(59, 58, 54)',
    'text-transform': 'uppercase',
    'letter-spacing': '0.608px',
    'margin-top': '0px',
    'margin-bottom': '6px',
  },
  '.tessera-hours dl': {
    'font-family': 'system-ui, sans-serif',
    'font-size': '14.4px',
    'line-height': '20.16px',
  },
}
const TITLE = {
  'font-family': SERIF,
  'font-size': '24px',
  'font-style': 'italic',
  color: 'rgb(122, 46, 58)',
  'text-transform': 'none',
  'letter-spacing': 'normal',
  'margin-bottom': '4px',
  'margin-top': '0px',
}
const TOKENS = {
  '--paper': '#faf8f4',
  '--card': '#ffffff',
  '--ink': '#22201c',
  '--muted': '#6a645a',
  '--accent': '#7a2e3a',
  '--badge-loan': '#efe0b9',
  '--badge-loan-ink': '#5a4310',
  '--space': '16px',
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})
try {
  for (const width of [390, 1280]) {
    const at = `at ${width}px`
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    await page.goto(pathToFileURL(join(dir, 'index.html')).href)
    const seen = await page.evaluate(
      ([selectors, props, tokens]) => {
        const style = (el) => {
          const c = getComputedStyle(el)
          return Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)]))
        }
        const all = (sel) => [...document.querySelectorAll(sel)].map(style)
        const root = getComputedStyle(document.documentElement)
        return {
          parts: Object.fromEntries(selectors.map((s) => [s, all(s)])),
          titles: all('.label__title'),
          badges: all('.badge--loan'),
          tokens: Object.fromEntries(tokens.map((t) => [t, root.getPropertyValue(t).trim()])),
          columns: getComputedStyle(document.querySelector('.wall')).gridTemplateColumns.split(' ')
            .length,
        }
      },
      [Object.keys(UNCHANGED), PROPS, Object.keys(TOKENS)],
    )
    assert.equal(seen.titles.length, 4, `${at}: four artwork titles`)
    for (const title of seen.titles)
      for (const [prop, value] of Object.entries(TITLE))
        assert.equal(title[prop], value, `${at}: artwork title ${prop}`)
    assert.equal(seen.badges.length, 2, `${at}: two loan badges`)
    for (const badge of seen.badges) {
      assert.equal(
        badge['background-color'],
        'rgb(239, 224, 185)',
        `${at}: loan badge uses --badge-loan`,
      )
      assert.equal(badge.color, 'rgb(90, 67, 16)', `${at}: loan badge text uses --badge-loan-ink`)
    }
    for (const [sel, expected] of Object.entries(UNCHANGED)) {
      assert.ok(seen.parts[sel].length, `${at}: ${sel} still on the page`)
      for (const got of seen.parts[sel])
        for (const [prop, value] of Object.entries(expected))
          assert.equal(got[prop], value, `${at}: ${sel} ${prop} unchanged`)
    }
    for (const [token, value] of Object.entries(TOKENS))
      assert.equal(seen.tokens[token].toLowerCase(), value, `${at}: token ${token} unchanged`)
    assert.equal(seen.columns, width === 390 ? 1 : 4, `${at}: label grid columns unchanged`)
    await page.close()
  }
} finally {
  await browser.close()
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
