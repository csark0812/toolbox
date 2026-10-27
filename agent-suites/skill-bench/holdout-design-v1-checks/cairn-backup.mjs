// Hidden acceptance for the backup tool page: it renders at a phone and a desktop width without
// page errors or sideways scroll, has one h1, shows every fact from the notes (version, platforms,
// destinations, commands, all three plans), shows the Homebrew install command as code, and uses
// no pictures: nothing but SVG in img, video or background images, and nothing remote.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'

const root = process.argv[2]
const page = 'index.html'
const MUST_SHOW = [
  /\b3\.2\b/,
  /brew install cairn/,
  /get\.cairn\.example\/install\.sh/,
  /cairn restore/,
  /cairn verify/,
  /\bage\b/,
  /S3/,
  /SFTP/,
  /USB/,
  /macOS 13/,
  /x86-64|x86_64/,
  /arm64/,
  /Windows 11/,
  /Personal/,
  /Free/i,
  /£\s?48\b/,
  /£\s?390\b/,
  /25 machines/i,
  /30-day refund|30 day refund|30 days/i,
  /Leeds/,
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
      code: [...document.querySelectorAll('code, pre, kbd, samp')].map((el) =>
        el.textContent.replace(/\s+/g, ' '),
      ),
      pictures: [
        ...[...document.querySelectorAll('img, source, video')].map(
          (el) => el.getAttribute('src') || el.getAttribute('srcset') || el.tagName,
        ),
        ...[...document.querySelectorAll('*')]
          .map((el) => getComputedStyle(el).backgroundImage)
          .filter((image) => /url\(/.test(image)),
      ]
        .map((src) => src.replaceAll(document.location.origin, ''))
        .filter((src) => !/^(url\(["']?)?(data:image\/svg|[^:"']*\.svg\b)/.test(src)),
    }))
    assert.deepEqual(errors, [], `${width}px: no page errors`)
    assert.ok(
      facts.scroll <= facts.client + 1,
      `${width}px: no sideways scroll (${facts.scroll} > ${facts.client})`,
    )
    assert.equal(facts.h1, 1, `${width}px: exactly one h1`)
    for (const fact of MUST_SHOW) assert.match(facts.text, fact, `${width}px: shows ${fact}`)
    assert.ok(
      facts.code.some((code) => code.includes('brew install cairn')),
      `${width}px: the install command is shown as code`,
    )
    assert.deepEqual(
      facts.pictures,
      [],
      `${width}px: no photos, screenshots or other raster pictures`,
    )
    await tab.close()
  }
} finally {
  await browser.close()
  await server.close()
}
