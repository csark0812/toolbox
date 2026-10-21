// Hidden acceptance for the language exchange restyle: the page renders at a phone and a desktop
// width without page errors or sideways scroll, has one h1, and keeps all the content: the three
// steps, all six languages, when and where with the price, all three questions with their answers
// (answers may sit in a disclosure), the call to action as an email link, and the organisers.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const MUST_SHOW = [
  /Tandem Tuesdays/,
  /Pick a table/i,
  /volunteer host/i,
  /Swap every 20 minutes/i,
  /bell/i,
  /Come back next week/i,
  /Spanish/,
  /Portuguese/,
  /Polish/,
  /Japanese/,
  /Arabic/,
  /French/,
  /18[:.]30/,
  /20[:.]30/,
  /The Old Library/i,
  /14 Cheltenham Road/i,
  /BS6\s?5RB/,
  /£\s?4\b/,
  /one drink/i,
  /no booking/i,
  /Do I need to be fluent/i,
  /isn['’]t listed/i,
  /bring a friend/i,
  /Inés and Kasia/,
  /2023/,
]
// FAQ answers may be collapsed behind their question, so these only need to be in the page.
const IN_PAGE = [/hosts keep the conversation moving/i, /three people ask/i, /same £\s?4/i]

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
      all: document.body.textContent.replace(/[\u00a0\u202f]/g, ' ').replace(/\s+/g, ' '),
      mailto: document.querySelectorAll('a[href^="mailto:hello@tandemtuesdays.example"]').length,
    }))
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    for (const fact of MUST_SHOW) assert.match(facts.text, fact, `${width}px: shows ${fact}`)
    for (const fact of IN_PAGE) assert.match(facts.all, fact, `${width}px: keeps ${fact}`)
    assert.ok(facts.mailto >= 1, `${width}px: the call to action is still an email link`)
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
