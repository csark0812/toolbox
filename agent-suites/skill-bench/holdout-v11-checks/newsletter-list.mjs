// Hidden acceptance for the mailing list speed-up: the same merged list as the original on random
// imports (Gmail dots, plus tags and googlemail, plus tags kept on other providers, case and spaces,
// addresses with no dot or two @, empty and missing addresses that must never merge with each other,
// missing names and join dates, tags differing only in case or blank, truthy unsubscribes), the
// caller's rows left alone, the frozen timing script under target with the same work, and the work
// committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { mergeSubscribers, mailOut, mailbox } = await import(
  pathToFileURL(join(dir, 'src/merge.mjs')).href
)

const DOTLESS = ['gmail.com', 'googlemail.com']
function refMailbox(email) {
  const trimmed = (email ?? '').trim().toLowerCase()
  const match = /^([^@\s]+)@([^@\s]+\.[^@\s]+)$/.exec(trimmed)
  if (!match) return null
  let [, local, domain] = match
  if (DOTLESS.includes(domain)) {
    local = local.split('+')[0].replace(/\./g, '')
    domain = 'gmail.com'
  }
  return `${local}@${domain}`
}
const tidyName = (name) => (name ?? '').trim().replace(/\s+/g, ' ')
function addTags(entry, tags) {
  for (const raw of tags ?? []) {
    const tag = raw.trim()
    if (!tag) continue
    if (!entry.tags.some((known) => known.toLowerCase() === tag.toLowerCase())) entry.tags.push(tag)
  }
}
function reference(rows) {
  const list = []
  for (const row of rows) {
    const address = refMailbox(row.email)
    const existing =
      address === null ? undefined : list.find((entry) => refMailbox(entry.email) === address)
    if (!existing) {
      const entry = {
        email: (row.email ?? '').trim(),
        name: tidyName(row.name),
        tags: [],
        joined: row.joined,
        unsubscribed: Boolean(row.unsubscribed),
        rows: 1,
        valid: address !== null,
      }
      addTags(entry, row.tags)
      list.push(entry)
      continue
    }
    existing.rows++
    if (!existing.name) existing.name = tidyName(row.name)
    addTags(existing, row.tags)
    if (row.joined < existing.joined) existing.joined = row.joined
    if (row.unsubscribed) existing.unsubscribed = true
  }
  return list
}

let seed = 71
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const ADDRESSES = [
  'ann.lund@gmail.com',
  'annlund@gmail.com',
  'Ann.Lund+walks@googlemail.com',
  '+walks@gmail.com',
  '.@gmail.com',
  'ann.lund@outlook.com',
  'annlund@outlook.com',
  'ann.lund+walks@outlook.com',
  'dev@stonebridge.org.uk',
  'DEV@Stonebridge.org.uk',
  'dev@stonebridge',
  'dev@@stonebridge.org.uk',
  'dev @stonebridge.org.uk',
  'ruth at the post office',
  '',
  undefined,
  '__proto__@x.com',
  'constructor@gmail.com',
]
const spell = (email) =>
  email === undefined ? undefined : pick([email, ` ${email}`, `${email}\t`, email.toUpperCase()])
const NAMES = ['', '  ', 'Ann Lund', ' Ann  Lund ', 'ann', undefined, 'Dev']
const TAGS = ['walks', 'Walks', ' walks', '', ' ', 'History', 'history', 'committee']
const JOINED = [undefined, '2019-01-01', '2020-06-14', '2020-06-14', '2024-12-31', '']
const UNSUB = [undefined, false, true, 0, 1]
for (let round = 0; round < 400; round++) {
  const rows = Array.from({ length: next() % 14 }, () => {
    const row = { email: spell(pick(ADDRESSES)), name: pick(NAMES), joined: pick(JOINED) }
    if (next() % 4) row.tags = Array.from({ length: next() % 4 }, () => pick(TAGS))
    const unsub = pick(UNSUB)
    if (unsub !== undefined) row.unsubscribed = unsub
    return row
  })
  const frozen = JSON.stringify(rows)
  const got = mergeSubscribers(rows)
  assert.deepEqual(got, reference(rows), `round ${round}: ${frozen}`)
  assert.deepEqual(
    mailOut(got),
    got.filter((entry) => entry.valid && !entry.unsubscribed),
    `round ${round}: mail-out`,
  )
  assert.equal(JSON.stringify(rows), frozen, "the caller's rows are not changed")
  for (const row of rows) assert.equal(mailbox(row.email), refMailbox(row.email), 'mailbox()')
}
// Two calls on the same rows give independent entries.
const twice = [{ email: 'a@b.com', tags: ['x'] }]
mergeSubscribers(twice)[0].tags.push('y')
assert.deepEqual(mergeSubscribers(twice)[0].tags, ['x'], 'entries are fresh on every call')

assert.equal(
  execFileSync(process.execPath, ['bin/merge.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    '  Margaret.Oduya@gmail.com       Margaret Oduya   2020-06-14 subscribed   walks, Planting',
    '  pete@stonebridge.org.uk        Pete Hallam      2019-11-20 unsubscribed committee, Walks',
    '  j.osei+walks@stonebridge.org.uk Jo Osei          2023-02-01 subscribed   ',
    '  j.osei@stonebridge.org.uk      Jo Osei          2022-09-09 subscribed   planting',
    '! ruth at the post office        Ruth Penney      -          subscribed   walks',
    '!                                Unknown          2024-01-05 subscribed   ',
    '! ruth at the post office        Ruth Penney      -          subscribed   ',
    '7 entries from 9 rows, 3 to mail',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 1600, 'the same number of entries')
assert.equal(perf.merged, 3200, 'every row accounted for')
assert.equal(perf.mailed, 1405, 'the same mail-out')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 20, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
