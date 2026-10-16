// Hidden acceptance for the gigs helper move: priceLabel lives on as formatPrice in src/money.mjs,
// fmtWhen as formatShowTime in src/dates.mjs, util.mjs keeps only slug, no old names survive in
// src/ or bin/, and every caller (listing, tickets, door table, RSS, the CLI's on-demand import)
// prints exactly what it printed before.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, 'src', file)).href)
const util = await load('util.mjs')
const money = await load('money.mjs')
const dates = await load('dates.mjs')
assert.deepEqual(Object.keys(util).sort(), ['slug'], 'util.mjs keeps only slug')
assert.equal(typeof money.formatPrice, 'function', 'src/money.mjs exports formatPrice')
assert.equal(typeof dates.formatShowTime, 'function', 'src/dates.mjs exports formatShowTime')
assert.equal(money.formatPrice(0), 'Free')
assert.equal(money.formatPrice(1800), '$18')
assert.equal(money.formatPrice(1505), '$15.05')
assert.equal(money.formatPrice(7), '$0.07')
assert.equal(
  dates.formatShowTime('2026-10-16T00:00:00Z', 'America/New_York'),
  'Thu, Oct 15, 8:00 PM',
)
assert.equal(dates.formatShowTime('2026-10-16T00:00:00Z', 'Europe/Berlin'), 'Fri, Oct 16, 2:00 AM')
const { orderSummary } = await load('tickets.mjs')
const { listingLine } = await load('listing.mjs')
const { loadShows } = await load('shows.mjs')
const shows = loadShows()
assert.deepEqual(orderSummary(shows[0], 3).lines, [
  '3 x Night Owls & Co. @ $18',
  'fees $4.50',
  'total $58.50',
])
assert.equal(
  listingLine({ ...shows[3], timeZone: 'UTC' }),
  'Sun, Nov 1, 2:15 AM  The Late Shift - $15.05  /shows/the-late-shift',
)
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of [...walk(join(dir, 'src')), ...walk(join(dir, 'bin'))])
  assert.doesNotMatch(
    readFileSync(file, 'utf8'),
    /\b(priceLabel|fmtWhen)\b/,
    `old name left in ${file}`,
  )
const GOLDEN = {
  list: 'Thu, Oct 15, 8:00 PM  Night Owls & Co. - $18  /shows/night-owls-co\nSat, Oct 17, 7:30 PM  Marisol Vega Trio - SOLD OUT  /shows/marisol-vega-trio\nThu, Oct 22, 7:00 PM  Open Mic <Thursday> - Free  /shows/open-mic-thursday\nSat, Oct 31, 10:15 PM  The Late Shift - $15.05  /shows/the-late-shift\n',
  table:
    'When                  | Artist              | Price  | Doors\nThu, Oct 15, 8:00 PM  | Night Owls & Co.    | $18    | 7:00 PM\nSat, Oct 17, 7:30 PM  | Marisol Vega Trio   | $22.50 | 6:30 PM\nThu, Oct 22, 7:00 PM  | Open Mic <Thursday> | Free   | 6:00 PM\nSat, Oct 31, 10:15 PM | The Late Shift      | $15.05 | 9:00 PM\n',
  rss: '<rss version="2.0"><channel>\n  <item><title>Night Owls &amp; Co.</title><link>https://example.invalid/shows/night-owls-co</link><description>Thu, Oct 15, 8:00 PM</description></item>\n  <item><title>Marisol Vega Trio</title><link>https://example.invalid/shows/marisol-vega-trio</link><description>Sat, Oct 17, 7:30 PM</description></item>\n  <item><title>Open Mic &lt;Thursday&gt;</title><link>https://example.invalid/shows/open-mic-thursday</link><description>Thu, Oct 22, 7:00 PM</description></item>\n  <item><title>The Late Shift</title><link>https://example.invalid/shows/the-late-shift</link><description>Sat, Oct 31, 10:15 PM</description></item>\n</channel></rss>\n',
  'price 1505': '$15.05\n',
  'price 0': 'Free\n',
  'price 2250': '$22.50\n',
}
for (const [args, want] of Object.entries(GOLDEN))
  assert.equal(
    execFileSync(process.execPath, ['bin/gigs.mjs', ...args.split(' ')], {
      cwd: dir,
      encoding: 'utf8',
    }),
    want,
    `gigs ${args}`,
  )
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
