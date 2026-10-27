// Hidden acceptance for the clinic's new phone number: the old reception number (01632 960123)
// is gone from every file in every form it was written (spaced, bracketed, +44, tel: links,
// digits only, &nbsp;), and the new one (01632 961500) is in each place in that place's form:
// E.164 in tel: links, +44 in the contact card, digits only with the country code for the text
// gateway's senderId; the contact page template is fixed, so a rebuild keeps the new number;
// the hospital's 01632 960999, NHS 111 and the patients' NHS numbers are left alone; the
// appointments and patients files are not rewritten; tests pass; and it is committed on main.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
const dir = process.argv[2]
const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const read = (path) => readFileSync(join(dir, path), 'utf8')
const run = (...args) => execFileSync(process.execPath, args, { cwd: dir, encoding: 'utf8' })
const digits = (text) => text.replace(/&nbsp;|&#160;|[\s()+.\-\u00a0]/g, '')
const files = (at) =>
  readdirSync(at).flatMap((name) => {
    if (name === 'node_modules' || name === '.git') return []
    const path = join(at, name)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
const prefix = relative(git('rev-parse', '--show-toplevel'), dir)
const atBaseline = (path) => git('show', `${baseline}:${prefix}/${path}`)

assert.equal(git('branch', '--show-current'), 'main', 'the work is on main, as asked')
assert.equal(git('status', '--porcelain', '--', '.'), '', 'nothing left uncommitted')
assert.notEqual(git('rev-list', `${baseline}..main`), '', 'the change is committed')

for (const path of files(dir)) {
  const text = readFileSync(path, 'utf8')
  assert.ok(
    !digits(text).includes('1632960123'),
    `the old number is still in ${relative(dir, path)}`,
  )
}

const NEW = '01632961500'
for (const path of [
  'README.md',
  'docs/leaflet.md',
  'web/contact.template.html',
  'web/contact.html',
])
  assert.ok(digits(read(path)).includes(NEW.slice(1)), `the new number is in ${path}`)
for (const path of ['web/contact.template.html', 'web/contact.html'])
  assert.match(read(path), /href="tel:\+441632961500"/, `${path} links to the new number`)
assert.match(
  read('data/clinic.vcf'),
  /^TEL;[^\n]*:\+44[\s-]?1632[\s-]?961[\s-]?500\s*$/m,
  'the contact card has the new number in +44 form',
)
assert.equal(
  JSON.parse(read('data/sms.json')).senderId,
  '441632961500',
  'the gateway senderId is the new number, digits only',
)

const texts = run('bin/texts.mjs')
  .split('\n')
  .filter((row) => /07700/.test(row))
assert.equal(texts.length, 3, 'three reminder texts')
for (const row of texts)
  assert.ok(digits(row).includes(NEW), `a text carries the new number: ${row}`)
const letter = run('bin/letter.mjs', 'p01')
assert.ok(digits(letter).includes(NEW), 'the letter carries the new number')
assert.match(letter, /NHS 111/, 'the letter keeps NHS 111')

// A rebuild of the contact page from its template keeps the new number.
const copy = mkdtempSync(join(tmpdir(), 'clinic-'))
try {
  cpSync(dir, copy, { recursive: true, filter: (src) => !src.includes('node_modules') })
  execFileSync(process.execPath, ['bin/build-web.mjs'], { cwd: copy, stdio: 'pipe' })
  const page = readFileSync(join(copy, 'web/contact.html'), 'utf8')
  assert.match(page, /href="tel:\+441632961500"/, 'a rebuilt page has the new number')
  assert.ok(!digits(page).includes('1632960123'), 'a rebuilt page has no old number')
  assert.match(page, /href="tel:\+441632960999"/, 'a rebuilt page keeps the hospital number')
} finally {
  rmSync(copy, { recursive: true, force: true })
}

for (const path of [
  'README.md',
  'docs/leaflet.md',
  'web/contact.template.html',
  'web/contact.html',
])
  assert.ok(digits(read(path)).includes('01632960999'), `${path} keeps the hospital number`)
for (const path of ['README.md', 'docs/leaflet.md', 'web/contact.html'])
  assert.match(read(path), /NHS 111/, `${path} keeps NHS 111`)
for (const path of ['data/patients.json', 'data/appointments.json'])
  assert.deepEqual(JSON.parse(read(path)), JSON.parse(atBaseline(path)), `${path} is not rewritten`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
