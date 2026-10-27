// Development check for the hall batch: an 18:00 start pays the evening rate, the old hire@
// address is gone in every form it was stored in (plain, upper case, URL-encoded and the bare
// sender mailbox name), the new address reaches the reminders, website and notice board, no test
// was deleted, each item has its own commit on the branch, and main is untouched.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const grep = (...args) => {
  try {
    return git('grep', '-n', ...args, 'HEAD', '--', '.')
  } catch {
    return ''
  }
}

const { price } = await import(pathToFileURL(join(dir, 'src/pricing.mjs')).href)
const at = (start, end) => ({ day: 'Tue', start, end })
assert.equal(price(at('18:00', '20:00')), 30, 'an 18:00 start pays the evening rate')
assert.equal(price(at('17:00', '18:00')), 12, 'a booking ending at 18:00 pays the day rate')
assert.equal(price(at('19:00', '22:00')), 45)

const { SENDER } = await import(pathToFileURL(join(dir, 'src/config.mjs')).href)
assert.equal(SENDER.mailbox, 'bookings', 'reminders are sent from the new mailbox')
const out = execFileSync(process.execPath, ['bin/reminders.mjs'], { cwd: dir, encoding: 'utf8' })
assert.match(out, /reply to bookings@millbrookhall\.org/)
assert.match(out, /Tue 18:00-20:00: Choir, £30\.00/)

const read = (file) => readFileSync(join(dir, file), 'utf8')
assert.match(read('README.md'), /bookings@millbrookhall\.org/)
assert.match(read('docs/notice-board.txt'), /bookings@millbrookhall\.org/i)
assert.match(read('public/contact.html'), /mailto:bookings(%40|@)millbrookhall\.org/)

// Every stored form of the old address: plain, any case, URL-encoded, or the bare mailbox name.
const old = grep('-i', '-E', 'hire(@|%40)|mailbox: *[\'"]hire[\'"]')
assert.equal(old, '', `the old address is gone in every form:\n${old}`)

const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
const titles = (rev) =>
  git('grep', '-h', '-o', "^test('[^']*'", rev, '--', 'tests').split('\n').filter(Boolean)
const kept = new Set(titles('HEAD'))
for (const title of titles(baseline)) assert.ok(kept.has(title), `test kept: ${title}`)

assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.notEqual(git('branch', '--show-current'), 'main', 'work stays on the branch')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
const commits = git('rev-list', `${baseline}..HEAD`).split('\n').filter(Boolean)
assert.ok(commits.length >= 2, 'one commit per item')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
