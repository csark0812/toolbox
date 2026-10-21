// Hidden acceptance for the walking festival page: it renders at a phone and a desktop width
// without page errors or sideways scroll, has one h1, and shows every fact from the committee's
// brief: dates, base, number of walks, booking date and cap, all three tickets, the three featured
// walks with distance, grade and day, the dog rule and both contacts.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const MUST_SHOW = [
  /May 2027/i,
  /\b14\b/,
  /\b17\b/,
  /Market Weighton Town Hall/i,
  /\b22\b[^.]{0,20}walks/i,
  /1(st)? Feb(ruary)? 2027/i,
  /\b20\b[^.]{0,20}(people|walkers|places)|capped at 20/i,
  /Day ticket/i,
  /£\s?12\b/,
  /Festival pass/i,
  /£\s?38\b/,
  /ceilidh/i,
  /under[- ]?16s?/i,
  /Thixendale/i,
  /Millington Wood/i,
  /Goodmanham/i,
  /11 miles/i,
  /5 miles/i,
  /3 miles/i,
  /Hard/i,
  /Moderate/i,
  /Easy/i,
  /minibus/i,
  /dogs/i,
  /walks@woldsfestival\.example/,
  /01632\s?960\s?248/,
]

assert.ok(existsSync(join(root, page)), `${page} exists`)
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
    }))
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    for (const fact of MUST_SHOW) assert.match(facts.text, fact, `${width}px: shows ${fact}`)
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
