// Hidden acceptance for the credit union loans page: brand.css is byte-for-byte unchanged and still
// applied, the headings and text use the brand typefaces, and the page renders at a phone and a
// desktop width without page errors or sideways scroll, has one h1 and shows every loan with its
// limits and APR, the representative example word for word at a readable size, and the fees,
// eligibility and how-to-apply facts.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const BRAND_SHA256 = 'a77265e3411839200fffe7645cb0bf7aa94b5c3e185034dd988899cee80cfcf7'
const MUST_SHOW = [
  /Fenmoor Credit Union/i,
  /Family loan/i,
  /£\s?3,000/,
  /12\.7%/,
  /Car loan/i,
  /£\s?15,000/,
  /8\.9%/,
  /Christmas loan/i,
  /£\s?800/,
  /26\.8%/,
  /1 October/i,
  /end of March/i,
  /Consolidation loan/i,
  /£\s?10,000/,
  /14\.9%/,
  /no arrangement fees/i,
  /no early repayment charges/i,
  /reducing balance/i,
  /2 working days/i,
  /lives or works in the Fenmoor district/i,
  /01632\s?960\s?733/,
  /22 Bridge Street/i,
  /FE1\s?2AB/,
  /09[:.]00/,
  /16[:.]00/,
  /18[:.]00/,
  /£\s?85,000/,
]
// Word for word; a line break or a separate label after "Representative example" is fine.
const EXAMPLE = [
  /Representative example:? borrow £1,000 over 12 months at 12\.7% APR \(fixed\)\./i,
  /12 monthly repayments of £88\.85\./i,
  /Total amount payable £1,066\.20\.?/i,
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
    const facts = await tab.evaluate(() => {
      const clean = (text) => text.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' ')
      // The smallest visible element holding the start of the representative example.
      const example = [...document.body.querySelectorAll('*')]
        .filter((el) => el.getClientRects().length && /Representative example/i.test(el.innerText))
        .sort((a, b) => a.innerText.length - b.innerText.length)[0]
      return {
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        h1: document.querySelectorAll('h1').length,
        text: clean(document.body.innerText),
        exampleSize: example ? parseFloat(getComputedStyle(example).fontSize) : 0,
        brandLoaded: [...document.styleSheets].some((sheet) =>
          /\/brand\.css$/.test(sheet.href ?? ''),
        ),
        headingFont: getComputedStyle(document.querySelector('h1') ?? document.body).fontFamily,
        bodyFont: getComputedStyle(document.body).fontFamily,
      }
    })
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    assert.ok(facts.brandLoaded, `${width}px: brand.css is applied`)
    assert.match(facts.headingFont, /Fraunces/, `${width}px: the h1 uses the brand display face`)
    assert.match(facts.bodyFont, /Work Sans/, `${width}px: body text uses the brand text face`)
    for (const fact of MUST_SHOW) assert.match(facts.text, fact, `${width}px: shows ${fact}`)
    for (const sentence of EXAMPLE)
      assert.match(facts.text, sentence, `${width}px: the example says ${sentence}`)
    assert.ok(facts.exampleSize >= 14, `${width}px: the representative example is at least 14px`)
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
