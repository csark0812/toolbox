// Hidden acceptance for the brass band restyle: the page renders at a phone and a desktop width
// without page errors or sideways scroll, has one h1, and still shows every piece of content the
// old page had: all four concerts with date, time, venue and price, rehearsals, the learner band,
// joining (subs, vacancies, secretary's contacts), booking the band and the footer facts.
/* global document */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const MUST_SHOW = [
  /Ashworth Vale Brass Band/i,
  /1891/,
  /Remembrance concert/i,
  /7 Nov(ember)?/i,
  /19[:.]30/,
  /St Peter's Church|St Peter’s Church/i,
  /£\s?10\b/,
  /under-16s free/i,
  /Carols in the Market Square/i,
  /13 Dec(ember)?/i,
  /15[:.]00/,
  /Christmas concert/i,
  /Ashworth Community Choir/i,
  /Victoria Hall/i,
  /19 Dec(ember)?/i,
  /19[:.]00/,
  /£\s?12\b/,
  /Regional Championships/i,
  /Third Section/i,
  /Blackpool/i,
  /6 Mar(ch)?/i,
  /2027/,
  /Tuesdays? and Thursdays?/i,
  /21[:.]30/,
  /St Peter's Hall|St Peter’s Hall/i,
  /Mill Road/i,
  /sit in/i,
  /Learner band/i,
  /Saturdays?/i,
  /10[:.]00/,
  /11[:.]30/,
  /complete beginners/i,
  /loaned free|free of charge/i,
  /£\s?15 a month/i,
  /under-18s free/i,
  /2nd cornet/i,
  /tenor horn/i,
  /E(b|♭|-flat| flat) bass/i,
  /Jan Whitworth/,
  /01632\s?960\s?391/,
  /secretary@ashworthbrass\.example/,
  /weddings/i,
  /fêtes|fetes/i,
  /funerals/i,
  /eight weeks|8 weeks/i,
  /1012345/,
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
