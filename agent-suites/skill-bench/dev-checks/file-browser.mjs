// Development check for the file list overflow: rendered in Chromium at phone and desktop widths,
// a long file name truncates inside its row, the size stays visible and the page never scrolls sideways.
/* global document, window */
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
const row = (id, name, size) =>
  `<li class="file-row" id="${id}"><img class="icon" alt="" /><div class="details"><span class="name">${name}</span><span class="modified">Today</span></div><span class="size">${size}</span></li>`
const markup = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${sheets.join('\n')}</style></head><body>
<div class="app"><nav class="sidebar">Folders</nav><main class="content"><ul class="file-list">
${row('short', 'notes.txt', '2 KB')}
${row('long', 'quarterly-planning-review-final-version-with-comments-from-finance-and-legal.pdf', '4.2 MB')}
</ul></main></div></body></html>`
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})
try {
  for (const width of [360, 1024]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } })
    await page.setContent(markup)
    const m = await page.evaluate(() => {
      const box = (sel) => document.querySelector(sel).getBoundingClientRect()
      const el = (sel) => document.querySelector(sel)
      return {
        page: document.documentElement.scrollWidth,
        view: window.innerWidth,
        row: box('#long').right,
        size: box('#long .size'),
        nameClient: el('#long .name').clientWidth,
        nameScroll: el('#long .name').scrollWidth,
        shortClient: el('#short .name').clientWidth,
        shortScroll: el('#short .name').scrollWidth,
        sidebar: box('.sidebar').width,
        content: box('.content').width,
      }
    })
    const at = `at ${width}px`
    assert.ok(m.page <= m.view, `page does not scroll sideways ${at} (${m.page} > ${m.view})`)
    assert.ok(m.size.right <= m.row + 0.5, `size stays inside its row ${at}`)
    assert.ok(m.size.right <= m.view, `size is on screen ${at}`)
    assert.ok(m.size.height < 30, `size stays on one line ${at}`)
    if (width === 360) assert.ok(m.nameScroll > m.nameClient, `long name is truncated ${at}`)
    assert.ok(m.nameClient >= 120, `long name keeps usable width ${at} (${m.nameClient}px)`)
    assert.ok(m.shortScroll <= m.shortClient, `short name is not truncated ${at}`)
    if (width === 1024) {
      assert.equal(Math.round(m.sidebar), 220, 'sidebar width is unchanged on desktop')
      assert.ok(m.content > 700, `content fills the remaining width on desktop (${m.content}px)`)
    }
    await page.close()
  }
} finally {
  await browser.close()
}
