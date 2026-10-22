// Hidden acceptance for moving the railway exhibition from Saturday 13 to Saturday 20 March 2027:
// every form of the show weekend's dates moves a week (ISO dates in show.json, the zero-based
// Date.UTC month in src/show.mjs, the ticket site's Unix seconds, the .ics stamps, the exhibitors'
// DD/MM/YYYY set-up dates, the dotted poster date, the written-out and ordinal dates in the
// templates, the club calendar and the README), the built web page is rebuilt from its template,
// and the look-alikes stay: the council's VH-20270313 reference, early-bird on 13 February, the
// PAT certificate dates, the committee meeting and last year's show. Committed on main, nothing
// left uncommitted, tests passing.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const read = (path) => readFileSync(join(dir, path), 'utf8')
const json = (path) => JSON.parse(read(path))
const run = (script, ...args) =>
  execFileSync(process.execPath, ['bin/' + script, ...args], { cwd: dir, encoding: 'utf8' })
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const files = (at) =>
  readdirSync(at).flatMap((name) => {
    if (name === 'node_modules' || name === '.git') return []
    const path = join(at, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })

const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('branch', '--show-current'), 'main', 'the work is on main')
assert.notEqual(git('rev-parse', 'HEAD'), baseline, 'the change is committed')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')

const show = json('data/show.json')
assert.equal(show.date, '2027-03-20', 'show date')
assert.equal(show.setupDay, '2027-03-19', 'set-up day')
assert.equal(show.takedownDay, '2027-03-21', 'takedown day')
assert.equal(show.venueRef, 'VH-20270313', "the council's reference is kept")
assert.equal(show.earlyBirdUntil, '2027-02-13', 'early-bird still closes on 13 February')

const listing = json('data/ticket-listing.json')
assert.equal(listing.startsAt, 1805536800, 'ticket site start, 10:00 GMT on 20 March')
assert.equal(listing.endsAt, 1805562000, 'ticket site end, 17:00 GMT on 20 March')

assert.match(run('countdown.mjs', '2027-03-01'), /^19 days to go/, 'the countdown')

const ticket = run('ticket.mjs', 'Ann Smith', 'Adult')
assert.match(ticket, /Saturday 20 March 2027/, 'the ticket date')
assert.match(ticket, /until 13 February/, 'the ticket keeps the early-bird date')

const letter = run('letters.mjs', 'Sian Pritchard')
assert.match(letter, /Friday 19th March/, 'the letter set-up day')
assert.match(letter, /Sunday 21st March/, 'the letter takedown day')
assert.match(letter, /valid until 13\/03\/2027/, 'the PAT date in the letter is unchanged')

const template = read('web/index.template.html')
assert.match(template, /datetime="2027-03-20"/, 'the template datetime')
assert.match(template, /Sat 20th March 2027/, 'the template strapline')
const { renderWeb } = await import(join(dir, 'src/web.mjs'))
assert.equal(read('web/index.html'), renderWeb(), 'the web page is rebuilt from its template')
assert.match(read('web/index.html'), /Saturday 20 March 2027/, 'the built page date')

const ics = read('calendar/show.ics')
assert.match(ics, /^DTSTART:20270320T100000Z$/m, 'the invite start')
assert.match(ics, /^DTEND:20270320T170000Z$/m, 'the invite end')

const csv = read('data/exhibitors.csv').trim().split('\n')
const head = csv[0].split(',')
const rows = csv
  .slice(1)
  .map((row) => Object.fromEntries(row.split(',').map((v, i) => [head[i], v])))
assert.equal(rows.length, 5, 'every exhibitor kept')
assert.ok(
  rows.every((row) => row.setup_date === '19/03/2027'),
  'exhibitor set-up dates',
)
assert.deepEqual(
  rows.map((row) => row.pat_tested_until),
  ['13/03/2027', '30/06/2027', '02/11/2027', '13/03/2027', '15/01/2028'],
  'PAT certificate dates are untouched',
)

assert.match(read('docs/poster.md'), /SAT 20\.3\.27/, 'the poster date')
assert.match(read('docs/poster.md'), /13\.2\.27/, 'the poster keeps the early-bird date')
const calendar = read('docs/club-calendar.md')
assert.match(calendar, /Sat 20 Mar 2027\s*\|\s*Exhibition,/, 'the club calendar show line')
assert.match(calendar, /Fri 19 Mar 2027\s*\|\s*Exhibition set-up/, 'the club calendar set-up line')
assert.match(calendar, /Wed 13 Jan 2027\s*\|\s*Committee meeting/, 'the committee meeting stays')
assert.match(calendar, /Sat 13 Feb 2027\s*\|\s*Early-bird/, 'early-bird stays in the calendar')
assert.match(read('docs/history.md'), /Saturday 14 March \(2026-03-14\)/, "last year's show stays")
assert.match(read('README.md'), /Saturday 20 March 2027/, 'the README date')

// No old form of the show weekend's dates is left anywhere in the project. Tests may name the old
// date on purpose (a countdown a week out, for example), so they are not searched.
const OLD = [
  /2027-03-1[234]\b/,
  /(?<!VH-)2027031[234]/,
  /\b1[234](th)? March 2027\b/,
  /\b1[234](th)? Mar 2027\b/,
  /Friday 12th March|Sunday 14th March|Sat 13th March/,
  /\b1[234]\.3\.27\b/,
  /\b1[24]\/03\/2027\b/,
  /Date\.UTC\(\s*2027,\s*2,\s*13\b/,
  /180493\d{4}|180495\d{4}/,
]
for (const path of files(dir)) {
  if (/^tests?\//.test(relative(dir, path))) continue
  const text = readFileSync(path, 'utf8')
  for (const pattern of OLD)
    assert.doesNotMatch(text, pattern, `old date form left in ${relative(dir, path)}`)
}
// The only 13/03/2027 left are the two PAT certificates (in the CSV).
const thirteenth = files(dir).filter(
  (path) => !path.endsWith('exhibitors.csv') && /13\/03\/2027/.test(readFileSync(path, 'utf8')),
)
assert.deepEqual(
  thirteenth.map((path) => relative(dir, path)).filter((path) => !/^tests?\//.test(path)),
  [],
  'no show date left as 13/03/2027',
)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
