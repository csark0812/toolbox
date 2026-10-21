// Development check for the crew screen: data rendered as a screen, not dumped, with the real facts.
/* global document */
import assert from 'node:assert/strict'
import { checkPage } from './visual-page.mjs'
import { launchBrowser, serve } from '../../../scripts/lib/bench-render.mjs'
const root = process.argv[2]
await checkPage(root, 'index.html', {
  mustShow: [
    'Jory Treloar',
    'Aisha Hendry',
    'Sam Rowe',
    /Loveday Curnow/,
    /Gull Rock/,
    /fouled propeller/i,
  ],
})
const server = await serve(root)
const browser = await launchBrowser()
try {
  const tab = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await tab.goto(`${server.url}/index.html`, { waitUntil: 'networkidle' })
  const raw = await tab.evaluate(() =>
    [...document.querySelectorAll('pre')].some((pre) => pre.innerText.includes('"onCall"')),
  )
  assert.equal(raw, false, 'the JSON is rendered, not dumped')
} finally {
  await browser.close()
  await server.close()
}
