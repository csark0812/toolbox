// Hidden acceptance for the archives visiting page: brand.css is byte-for-byte unchanged and still
// applied, the headings and text use the brand typefaces, and the page renders at a phone and a
// desktop width without page errors or sideways scroll, has one h1 and shows every fact the old
// page had: the closure notice, opening hours, address, access, contacts, reader's ticket, ordering
// rules, reading room rules and copy charges.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const BRAND_SHA256 = 'f107f2d1c063a0566b2c604ef702480faf2b38e95d93906dc83c94e449341afa'
const MUST_SHOW = [
  /Hollinshire Archives/i,
  /22 Dec(ember)?( 2026)?/i,
  /4 Jan(uary)? 2027/i,
  /stocktake/i,
  /Tue(sday)?/i,
  /Wed(nesday)?/i,
  /Thu(rsday)?/i,
  /09[:.]30/,
  /16[:.]30/,
  /first and third Saturday/i,
  /13[:.]00/,
  /cataloguing/i,
  /The Old Gaol/i,
  /Mill Lane/i,
  /HB3\s?7TA/,
  /step-free/i,
  /Gaol Yard/i,
  /hearing loop/i,
  /01632\s?960\s?552/,
  /archives@hollinshire\.example/,
  /reader['’]s ticket/i,
  /photo ID/i,
  /proof of address/i,
  /3 months/i,
  /3 working days/i,
  /6 items/i,
  /pencils only/i,
  /lockers?/i,
  /£\s?1 coin/i,
  /£\s?5 day permit|£\s?5 permit|permit[^.]{0,20}£\s?5/i,
  /no flash/i,
  /£\s?3\.50/,
  /£\s?12\b/,
]

const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')
assert.ok(existsSync(join(root, page)), `${page} exists`)
assert.ok(existsSync(join(root, 'brand.css')), 'brand.css is still there')
assert.equal(hash(join(root, 'brand.css')), BRAND_SHA256, 'brand.css is unchanged')
const server = await serve(root)
const browser = await launchBrowser()
try {
  for (const width of [390, 1440]) {
    const tab = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    tab.on('pageerror', (error) => errors.push(error.message))
    await tab.goto(`${server.url}/${page}`, { waitUntil: 'networkidle', timeout: 30000 })
    await tab.waitForTimeout(400)
    const facts = await tab.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
      h1: document.querySelectorAll('h1').length,
      text: document.body.innerText.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '),
      brandLoaded: [...document.styleSheets].some((sheet) =>
        /\/brand\.css$/.test(sheet.href ?? ''),
      ),
      headingFont: getComputedStyle(document.querySelector('h1') ?? document.body).fontFamily,
      bodyFont: getComputedStyle(document.body).fontFamily,
    }))
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    assert.ok(facts.brandLoaded, `${width}px: brand.css is applied`)
    assert.match(
      facts.headingFont,
      /Libre Baskerville/,
      `${width}px: the h1 uses the brand display face`,
    )
    assert.match(facts.bodyFont, /Source Sans 3/, `${width}px: body text uses the brand text face`)
    for (const fact of MUST_SHOW) assert.match(facts.text, fact, `${width}px: shows ${fact}`)
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
