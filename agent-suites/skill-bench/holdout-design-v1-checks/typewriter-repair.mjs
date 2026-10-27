// Hidden acceptance for the typewriter workshop page: it renders at a phone and a desktop width
// without page errors or sideways scroll, has one h1, shows every fact from the brief (address,
// hours, phone, every service price and every machine for sale), offers the phone number as a tap
// to call link, and uses no remote or stock pictures.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const MUST_SHOW = [
  /Corn Exchange Lane/i,
  /BN7\s?2QX/,
  /Lewes/,
  /01632\s?960\s?117/,
  /Tue(sday)?/i,
  /Sat(urday)?/i,
  /10[.:]00|10\s?am/i,
  /17[.:]00|5\s?pm/i,
  /manual/i,
  /£\s?85\b/,
  /£\s?60\b/,
  /£\s?9\b/,
  /£\s?25\b/,
  /£\s?180\b/,
  /Lettera 32/i,
  /SM9/,
  /Hermes 3000/i,
  /£\s?220\b/,
  /£\s?295\b/,
  /£\s?340\b/,
  /ruth@hartleytypewriters\.example/,
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
      tel: [...document.querySelectorAll('a[href^="tel:"]')].map((a) =>
        a.getAttribute('href').replace(/\D/g, ''),
      ),
      remotePictures: [
        ...[...document.querySelectorAll('img, source, video')].map(
          (el) => el.currentSrc || el.getAttribute('src') || el.getAttribute('srcset') || '',
        ),
        ...[...document.querySelectorAll('*')].map((el) => getComputedStyle(el).backgroundImage),
      ].filter((src) => /^https?:|url\(["']?https?:/.test(src) && !/127\.0\.0\.1/.test(src)),
    }))
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    for (const fact of MUST_SHOW) assert.match(facts.text, fact, `${width}px: shows ${fact}`)
    assert.ok(
      facts.tel.some((digits) => /^(0|44)1632960117$/.test(digits)),
      `${width}px: the phone number is a tap-to-call link`,
    )
    assert.deepEqual(facts.remotePictures, [], `${width}px: no remote or stock pictures`)
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
