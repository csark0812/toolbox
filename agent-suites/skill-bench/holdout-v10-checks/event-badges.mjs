// Hidden acceptance for the event badges: printed to PDF by Chromium with background graphics off
// (the print dialog's default), the badges come out on three A4 portrait sheets, ten to a sheet in
// two columns of five, each badge's dashed cutting guide on the 90 x 54mm die-cut grid inside the
// 15mm side and 13.5mm top margins, and each role strip in that person's role colour along the
// bottom of the badge. Nothing else prints: no header, intro, toolbar or grey page background, and
// no badge's text spills outside it. On screen, at 1280px and 390px, every element renders exactly
// as the original stylesheet did.
/* global document, getComputedStyle */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { inflateSync } from 'node:zlib'
import { chromium } from 'playwright'

// The stylesheet as it was before the change, rendered alongside for comparison.
const ORIGINAL_CSS = `:root {
  --bg: #eef0f3;
  --paper: #ffffff;
  --ink: #1b1f24;
  --muted: #5b6470;
  --line: #d5d9de;
  --accent: #23395b;
  --speaker: #b4233c;
  --staff: #1f5f8b;
  --sponsor: #7a4fa3;
  --attendee: #2e7d4f;
  --radius: 10px;
}

@page {
  size: A4;
  margin: 13.5mm 15mm;
}

/* Printing onto LabelCo LC10-9054 badge stock */
@media print {
  .site-header,
  .intro,
  .toolbar {
    display: none;
  }

  body {
    margin: 0;
    background: none;
  }

  .badges {
    grid-template-columns: repeat(2, 90mm);
    gap: 0;
    max-width: none;
    padding: 0;
  }

  .badge {
    width: 90mm;
    height: 54mm;
    border: 0.25mm dashed #9aa3ad;
    border-radius: 0;
    box-shadow: none;
    break-inside: avoid;
  }
}

@media screen {
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
  }
}

body {
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.3;
}

.site-header {
  padding: 20px 24px 12px;
  background: var(--accent);
  color: var(--paper);
}

.site-header h1 {
  margin: 0;
  font-size: 1.4rem;
}

.site-header__event {
  margin: 4px 0 0;
  opacity: 0.85;
}

.intro {
  max-width: 1100px;
  margin: 16px auto 0;
  padding: 0 24px;
  color: var(--muted);
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: 1100px;
  margin: 12px auto 0;
  padding: 0 24px;
}

.toolbar__search {
  flex: 1 1 200px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  font: inherit;
}

.chip {
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  font: inherit;
}

.chip--on {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--paper);
}

.toolbar__print {
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  background: var(--accent);
  color: var(--paper);
  font: inherit;
  font-weight: 600;
}

.badges {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.badge {
  display: flex;
  flex-direction: column;
  min-height: 200px;
  padding: 5mm 6mm 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--paper);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.08);
}

.badge__event {
  margin: 0;
  color: var(--muted);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.badge__name {
  margin: 2mm 0 0;
  font-size: 1.5rem;
  line-height: 1.1;
}

.badge__org {
  margin: 1mm 0 0;
  color: var(--muted);
}

.badge__role {
  margin: auto -6mm 0;
  padding: 2mm 6mm;
  background: var(--role);
  color: var(--paper);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.badge--speaker {
  --role: var(--speaker);
}

.badge--staff {
  --role: var(--staff);
}

.badge--sponsor {
  --role: var(--sponsor);
}

.badge--attendee {
  --role: var(--attendee);
}
`
const PROPS = [
  'display',
  'color',
  'background-color',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-transform',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-bottom',
  'border-top-width',
  'border-top-style',
  'border-top-color',
  'border-top-left-radius',
  'box-shadow',
  'opacity',
]
const ROLE = {
  speaker: [180, 35, 60],
  staff: [31, 95, 139],
  sponsor: [122, 79, 163],
  attendee: [46, 125, 79],
}
const GUIDE = [154, 163, 173]
const PAGE_BG = [238, 240, 243]
const ACCENT = [35, 57, 91]
const MM = 0.6

// Returns, for each page content stream, the filled shapes as { color: [r,g,b], box: [x0,y0,x1,y1] }
// in millimetres from the top-left corner of the sheet.
function pdfFills(pdf) {
  const s = pdf.toString('latin1')
  const pageH = Number(/\/MediaBox\s*\[\s*[\d.]+\s+[\d.]+\s+[\d.]+\s+([\d.]+)\s*\]/.exec(s)[1])
  const pages = []
  for (const m of s.matchAll(/stream\r?\n/g)) {
    const start = m.index + m[0].length
    const end = s.indexOf('endstream', start)
    if (end < 0) break
    let text
    try {
      text = inflateSync(Buffer.from(s.slice(start, end), 'latin1')).toString('latin1')
    } catch {
      continue
    }
    if (!/\bcm\b/.test(text) || !/\b(re|l)\b/.test(text)) continue
    const fills = []
    let ctm = [1, 0, 0, 1, 0, 0]
    const stack = []
    let color = [0, 0, 0]
    let path = []
    const args = []
    const apply = (x, y) => [ctm[0] * x + ctm[2] * y + ctm[4], ctm[1] * x + ctm[3] * y + ctm[5]]
    let inText = false
    for (const tok of text.split(/\s+/)) {
      if (tok === '') continue
      if (/^[-+]?(\d+\.?\d*|\.\d+)$/.test(tok)) {
        args.push(Number(tok))
        continue
      }
      if (tok === 'BT') inText = true
      else if (tok === 'ET') inText = false
      else if (tok === 'q') stack.push(ctm)
      else if (tok === 'Q') ctm = stack.pop() ?? [1, 0, 0, 1, 0, 0]
      else if (tok === 'cm' && args.length >= 6) {
        const [a, b, c, d, e, f] = args.slice(-6)
        const [A, B, C, D, E, F] = ctm
        ctm = [
          a * A + b * C,
          a * B + b * D,
          c * A + d * C,
          c * B + d * D,
          e * A + f * C + E,
          e * B + f * D + F,
        ]
      } else if (tok === 'rg' && args.length >= 3) color = args.slice(-3)
      else if (tok === 're' && args.length >= 4) {
        const [x, y, w, h] = args.slice(-4)
        path.push(apply(x, y), apply(x + w, y + h))
      } else if ((tok === 'm' || tok === 'l') && args.length >= 2)
        path.push(apply(...args.slice(-2)))
      else if ((tok === 'f' || tok === 'f*' || tok === 'F') && !inText) {
        if (path.length) {
          const xs = path.map((p) => p[0])
          const ys = path.map((p) => pageH - p[1])
          const mm = 25.4 / 72
          fills.push({
            color: color.map((v) => Math.round(v * 255)),
            box: [
              Math.min(...xs) * mm,
              Math.min(...ys) * mm,
              Math.max(...xs) * mm,
              Math.max(...ys) * mm,
            ],
          })
        }
        path = []
      } else if (tok === 'n' || tok === 'S' || tok === 's' || tok === 'B' || tok === 'b') path = []
      args.length = 0
    }
    pages.push(fills)
  }
  return pages
}

const dir = process.argv[2]
const url = pathToFileURL(join(dir, 'index.html')).href
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium',
})

const snapshot = (page) =>
  page.evaluate(
    (props) =>
      [...document.body.querySelectorAll('*')].map((el, i) => {
        const r = el.getBoundingClientRect()
        const c = getComputedStyle(el)
        return {
          path: `${i}:${el.tagName.toLowerCase()}.${el.className}`,
          rect: [r.left, r.top, r.width, r.height].map((v) => Math.round(v * 2) / 2),
          style: Object.fromEntries(props.map((p) => [p, c.getPropertyValue(p)])),
        }
      }),
    PROPS,
  )

const fails = []
const expect = (ok, message) => {
  if (!ok) fails.push(message)
}
const near = (a, b, tol = MM) => Math.abs(a - b) <= tol
const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 2)

try {
  // On screen nothing changes.
  for (const width of [1280, 390]) {
    const at = `on screen at ${width}px`
    const before = await browser.newPage({ viewport: { width, height: 900 } })
    await before.route('**/styles.css', (route) =>
      route.fulfill({ contentType: 'text/css', body: ORIGINAL_CSS }),
    )
    await before.goto(url)
    const after = await browser.newPage({ viewport: { width, height: 900 } })
    await after.goto(url)
    const [was, now] = [await snapshot(before), await snapshot(after)]
    expect(now.length === was.length, `${at}: same elements`)
    was.forEach((b, i) => {
      const a = now[i]
      if (!a) return
      expect(
        a.rect.every((v, k) => Math.abs(v - b.rect[k]) <= 0.5),
        `${at}: ${b.path} is at ${a.rect} (was ${b.rect})`,
      )
      for (const p of PROPS)
        expect(
          a.style[p] === b.style[p],
          `${at}: ${b.path} ${p} is ${a.style[p]} (was ${b.style[p]})`,
        )
    })
    await before.close()
    await after.close()
  }

  // Printed, only the badges come out, with their text inside them.
  const page = await browser.newPage({ viewport: { width: 680, height: 1020 } })
  await page.goto(url)
  await page.emulateMedia({ media: 'print' })
  const printed = await page.evaluate(() => ({
    chrome: ['.site-header', '.intro', '.toolbar'].map((s) => {
      const r = document.querySelector(s).getBoundingClientRect()
      return [s, r.width * r.height]
    }),
    roles: [...document.querySelectorAll('.badge')].map(
      (b) => /badge--(\w+)/.exec(b.className)?.[1],
    ),
    spill: [...document.querySelectorAll('.badge')].flatMap((badge) => {
      const box = badge.getBoundingClientRect()
      const name = badge.querySelector('.badge__name').textContent
      return [...badge.querySelectorAll('*')]
        .filter((el) => {
          const r = el.getBoundingClientRect()
          const range = document.createRange()
          range.selectNodeContents(el)
          const rects = [r, ...range.getClientRects()].filter((x) => x.width > 0)
          return rects.some(
            (x) =>
              x.left < box.left - 1 ||
              x.right > box.right + 1 ||
              x.top < box.top - 1 ||
              x.bottom > box.bottom + 1,
          )
        })
        .map((el) => `${el.className} on ${name}'s badge`)
    }),
  }))
  for (const [s, area] of printed.chrome) expect(area === 0, `printed: ${s} is not printed`)
  expect(
    printed.spill.length === 0,
    `printed: text spills out of a badge: ${printed.spill.slice(0, 3)}`,
  )
  assert.equal(printed.roles.length, 23, 'printed: 23 badges')

  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: false })
  const size = /\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(
    pdf.toString('latin1'),
  )
  const [w, h] = [Number(size[3]) * (25.4 / 72), Number(size[4]) * (25.4 / 72)]
  expect(
    near(w, 210, 1) && near(h, 297, 1),
    `printed: the sheet is A4 portrait (${w.toFixed(1)} x ${h.toFixed(1)}mm)`,
  )
  const pages = pdfFills(pdf)
  expect(pages.length === 3, `printed: the badges take three sheets (${pages.length})`)
  for (const [p, fillsOnPage] of pages.entries()) {
    for (const f of fillsOnPage) {
      expect(!same(f.color, PAGE_BG), `printed: sheet ${p + 1} has the grey page background`)
      expect(!same(f.color, ACCENT), `printed: sheet ${p + 1} has screen-only blue on it`)
    }
  }
  printed.roles.forEach((role, i) => {
    const sheet = Math.floor(i / 10)
    const col = i % 2
    const row = Math.floor((i % 10) / 2)
    const left = 15 + col * 90
    const right = left + 90
    const top = 13.5 + row * 54
    const bottom = top + 54
    const at = `printed: badge ${i + 1} (${role}, sheet ${sheet + 1}, row ${row + 1}, column ${col + 1})`
    const fills = pages[sheet] ?? []
    const strip = fills.find(
      (f) =>
        same(f.color, ROLE[role]) &&
        near(f.box[0], left) &&
        near(f.box[2], right) &&
        near(f.box[3], bottom) &&
        f.box[3] - f.box[1] >= 5 &&
        f.box[3] - f.box[1] <= 20,
    )
    expect(strip, `${at}: its ${role} strip prints along the bottom edge of the die-cut badge`)
    const guide = (y) =>
      fills.some(
        (f) =>
          same(f.color, GUIDE) &&
          f.box[3] - f.box[1] <= 1 &&
          near(f.box[1], y) &&
          near(f.box[0], left) &&
          near(f.box[2], right),
      )
    expect(
      guide(top) && guide(bottom - 0.25),
      `${at}: its dashed cutting guide sits on the die-cut line`,
    )
  })
  await page.close()
} finally {
  await browser.close()
}
assert.deepEqual(fails, [], fails.slice(0, 12).join('\n'))
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
