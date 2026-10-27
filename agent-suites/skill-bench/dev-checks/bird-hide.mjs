// Development check for the sightings page overflow: rendered in Chromium at every width from 320 to
// 1440px, the page never scrolls sideways, no filter or table cell is hidden or clipped away, and the
// desktop layout keeps the filters on one row.
/* global document, window, getComputedStyle */
import assert from 'node:assert/strict'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
const dir = resolve(process.argv[2])
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
  await page.goto(pathToFileURL(join(dir, 'index.html')).href)
  const widths = []
  for (let width = 320; width <= 1440; width += 10) widths.push(width)
  for (const width of widths) {
    await page.setViewportSize({ width, height: 800 })
    const m = await page.evaluate(() => {
      const hides = (el) => {
        for (let node = el.parentElement; node; node = node.parentElement) {
          const x = getComputedStyle(node).overflowX
          if (x === 'hidden' || x === 'clip') return true
        }
        return false
      }
      const items = [...document.querySelectorAll('.filters a, .log th, .log td')]
      return {
        page: document.documentElement.scrollWidth,
        view: window.innerWidth,
        chips: document.querySelectorAll('.filters a').length,
        cells: document.querySelectorAll('.log th, .log td').length,
        hidden: items
          .filter((el) => {
            const box = el.getBoundingClientRect()
            return !box.width || !box.height || getComputedStyle(el).visibility !== 'visible'
          })
          .map((el) => el.textContent.trim()),
        clipped: items.filter(hides).map((el) => el.textContent.trim()),
        truncated: items
          .filter((el) => el.scrollWidth > el.clientWidth + 1)
          .map((el) => el.textContent.trim()),
        rows: new Set(
          [...document.querySelectorAll('.filters a')].map((a) =>
            Math.round(a.getBoundingClientRect().top),
          ),
        ).size,
      }
    })
    const at = `at ${width}px`
    assert.ok(m.page <= m.view, `page does not scroll sideways ${at} (${m.page} > ${m.view})`)
    assert.equal(m.chips, 8, `all eight filters are present ${at}`)
    assert.equal(m.cells, 16, `the table keeps its four columns and three rows ${at}`)
    assert.deepEqual(m.hidden, [], `no filter or cell is hidden ${at}`)
    assert.deepEqual(m.clipped, [], `no filter or cell sits inside a box that cuts it off ${at}`)
    assert.deepEqual(m.truncated, [], `no filter or cell text is truncated ${at}`)
    if (width >= 1280) assert.equal(m.rows, 1, `filters stay on one row on desktop ${at}`)
  }
} finally {
  await browser.close()
}
