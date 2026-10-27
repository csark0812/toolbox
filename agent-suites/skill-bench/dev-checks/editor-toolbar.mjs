// Development check for the toolbar danger button: rendered in Chromium, a danger button in the
// toolbar keeps its variant colours at rest and on hover, and every other button is unchanged.
/* global getComputedStyle */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright'
const dir = process.argv[2]
const html = readFileSync(join(dir, 'index.html'), 'utf8')
const sheets = [...html.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(([, href]) =>
  readFileSync(join(dir, href), 'utf8'),
)
assert.ok(sheets.length, 'index.html links its stylesheets')
const markup = `<style>${sheets.join('\n')}</style>
<div class="toolbar"><button class="btn" id="t-plain">Save</button><button class="btn btn-danger" id="t-danger">Delete</button></div>
<footer class="dialog-footer"><button class="btn" id="f-plain">Cancel</button><button class="btn btn-danger" id="f-danger">Delete forever</button></footer>`
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})
try {
  const page = await browser.newPage()
  await page.setContent(markup)
  const style = (id) =>
    page.$eval(`#${id}`, (el) => {
      const s = getComputedStyle(el)
      return `${s.backgroundColor} / ${s.color}`
    })
  const at = async (id, hover) => {
    await page.mouse.move(0, 0)
    if (hover) await page.hover(`#${id}`)
    return style(id)
  }
  const red = 'rgb(220, 38, 38) / rgb(255, 255, 255)'
  const redHover = 'rgb(185, 28, 28) / rgb(255, 255, 255)'
  assert.equal(await at('t-danger'), red, 'toolbar danger button at rest')
  assert.equal(await at('t-danger', true), redHover, 'toolbar danger button on hover')
  assert.equal(await at('t-plain'), 'rgb(243, 244, 246) / rgb(31, 41, 55)', 'toolbar button')
  assert.equal(
    await at('t-plain', true),
    'rgb(229, 231, 235) / rgb(31, 41, 55)',
    'toolbar button hover',
  )
  assert.equal(await at('f-danger'), red, 'danger button outside the toolbar')
  assert.equal(await at('f-danger', true), redHover, 'danger hover outside the toolbar')
  assert.equal(await at('f-plain'), 'rgb(37, 99, 235) / rgb(255, 255, 255)', 'plain button')
  assert.equal(
    await at('f-plain', true),
    'rgb(29, 78, 216) / rgb(255, 255, 255)',
    'plain button hover',
  )
} finally {
  await browser.close()
}
