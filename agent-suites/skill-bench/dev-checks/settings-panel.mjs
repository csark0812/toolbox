// Development check for the dark notice: rendered in Chromium under every OS scheme and theme
// switch setting, the notice text and link reach 4.5:1 and light mode looks exactly as before.
/* global document, getComputedStyle */
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
const markup = (
  theme,
) => `<!doctype html><html${theme ? ` data-theme="${theme}"` : ''}><head><style>${sheets.join('\n')}</style></head><body>
<section class="panel"><h1>Account settings</h1><p class="hint">Changes apply to every device you use.</p>
<p class="notice">Your plan renews in 3 days. <a href="/billing">Review billing</a></p></section></body></html>`
const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})
try {
  for (const scheme of ['light', 'dark'])
    for (const theme of [null, 'light', 'dark']) {
      const page = await browser.newPage({ colorScheme: scheme })
      await page.setContent(markup(theme))
      // Resolve every colour to sRGB bytes through a canvas, compositing the notice over the panel.
      const c = await page.evaluate(() => {
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
        const paint = (...colors) => {
          ctx.clearRect(0, 0, 1, 1)
          for (const color of colors) {
            ctx.fillStyle = color
            ctx.fillRect(0, 0, 1, 1)
          }
          return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)]
        }
        const s = (sel) => getComputedStyle(document.querySelector(sel))
        const panel = paint(s('body').backgroundColor, s('.panel').backgroundColor)
        const notice = paint(
          s('body').backgroundColor,
          s('.panel').backgroundColor,
          s('.notice').backgroundColor,
        )
        return {
          panel,
          panelText: paint(s('.panel').backgroundColor, s('.panel').color),
          notice,
          text: paint(
            ...['body', '.panel', '.notice'].map((q) => s(q).backgroundColor),
            s('.notice').color,
          ),
          link: paint(
            ...['body', '.panel', '.notice'].map((q) => s(q).backgroundColor),
            s('.notice a').color,
          ),
        }
      })
      const at = `with OS ${scheme} and theme switch ${theme ?? 'unset'}`
      const light = theme === 'light' || (theme === null && scheme === 'light')
      const textRatio = contrast(c.text, c.notice)
      const linkRatio = contrast(c.link, c.notice)
      assert.ok(textRatio >= 4.5, `notice text contrast ${textRatio.toFixed(2)} ${at}`)
      assert.ok(linkRatio >= 4.5, `notice link contrast ${linkRatio.toFixed(2)} ${at}`)
      if (light) {
        assert.deepEqual(c.notice, [254, 243, 199], `light notice background unchanged ${at}`)
        assert.deepEqual(c.text, [17, 24, 39], `light notice text unchanged ${at}`)
        assert.deepEqual(c.link, [29, 78, 216], `light notice link unchanged ${at}`)
        assert.deepEqual(c.panel, [249, 250, 251], `light panel unchanged ${at}`)
      } else {
        assert.deepEqual(c.panel, [31, 41, 55], `dark panel unchanged ${at}`)
        assert.deepEqual(c.panelText, [249, 250, 251], `dark panel text unchanged ${at}`)
      }
      await page.close()
    }
} finally {
  await browser.close()
}
