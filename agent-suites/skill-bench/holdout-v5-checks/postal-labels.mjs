// Hidden acceptance for the formatAddress options migration: the options object gives the same
// text for every combination, the positional booleans are gone from the function and from every
// caller (including the preset table spread and the template's .apply), and labels, manifest and
// slips are byte-identical.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const load = (file) => import(pathToFileURL(join(dir, file)).href)
const { formatAddress } = await load('src/address.mjs')
const { render } = await load('src/template.mjs')
const home = {
  name: 'Priya Raman',
  line1: 'Flat 2',
  line2: '88 Gloucester Road',
  city: 'Bristol',
  region: 'Avon',
  postcode: 'BS7 8BN',
  country: 'United Kingdom',
}
const parts = ['Priya Raman', 'Flat 2', '88 Gloucester Road', 'Bristol Avon BS7 8BN']
for (const multiline of [false, true])
  for (const includeCountry of [false, true])
    for (const uppercase of [false, true]) {
      const lines = includeCountry ? [...parts, 'United Kingdom'] : parts
      const text = lines.join(multiline ? '\n' : ', ')
      assert.equal(
        formatAddress(home, { multiline, includeCountry, uppercase }),
        uppercase ? text.toUpperCase() : text,
        JSON.stringify({ multiline, includeCountry, uppercase }),
      )
    }
assert.equal(formatAddress(home), parts.join(', '), 'defaults: one line, no country, as typed')
assert.equal(formatAddress(home, {}), parts.join(', '))
assert.equal(formatAddress(home, { uppercase: true }), parts.join(', ').toUpperCase())
let positional
try {
  positional = formatAddress(home, true, true, true)
} catch {
  positional = null
}
assert.notEqual(
  positional,
  [...parts, 'United Kingdom'].join('\n').toUpperCase(),
  'the positional boolean form is gone',
)
assert.equal(
  render('{{a|country,upper}}', { a: home }),
  `${parts.join(', ')}, United Kingdom`.toUpperCase(),
)

const GOLDEN = {
  '--preset envelope': '55205e17092d7212',
  '--preset customs': 'ac7226c3a455359b',
  '--preset csv': '9996c8e7a38679a8',
  '--preset sms': '30168e3209f8bb01',
  '--manifest': 'a14fb089cf048449',
  '--slip PT-1041': '00ca065352a2ecd7',
  '--slip PT-1042': '2bf3229d808106a7',
  '--slip PT-1043': '6d6057b55dc34ddf',
  '': '55205e17092d7212',
}
for (const [args, hash] of Object.entries(GOLDEN)) {
  const out = execFileSync(
    process.execPath,
    ['bin/labels.mjs', ...args.split(' ').filter(Boolean)],
    {
      cwd: dir,
    },
  )
  assert.equal(
    createHash('sha256').update(out).digest('hex').slice(0, 16),
    hash,
    `labels ${args} prints the same bytes`,
  )
}
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of ['src', 'bin', 'tests'].flatMap((sub) => walk(join(dir, sub)))) {
  const text = readFileSync(file, 'utf8')
  assert.doesNotMatch(text, /formatAddress\s*\.\s*(apply|call)\b/, `${file}: .apply/.call left`)
  assert.doesNotMatch(
    text,
    /formatAddress\s*\([^()]*,\s*(true|false|\.\.\.)/,
    `${file}: a positional boolean call is left`,
  )
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
