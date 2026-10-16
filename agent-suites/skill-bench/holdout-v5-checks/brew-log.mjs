// Hidden acceptance for the brew-log config refactor: only src/config.mjs reads process.env,
// loadConfig() exists, and the CLI gives byte-identical output, errors and exit codes for every
// setting (units, data folder, each alert limit including the dynamically named ones, empty
// values, NO_COLOR, an invalid unit at startup).
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { loadConfig } = await import(pathToFileURL(join(dir, 'src/config.mjs')).href)
assert.equal(typeof loadConfig, 'function', 'src/config.mjs exports loadConfig')
loadConfig({})

const other = mkdtempSync(join(tmpdir(), 'brew-check-'))
writeFileSync(
  join(other, 'batches.json'),
  JSON.stringify([
    {
      name: 'Garage Kölsch',
      style: 'kolsch',
      brewed: '2026-10-01',
      originalGravity: 1.046,
      readings: [{ at: '2026-10-15T10:00:00Z', tempC: 15.5, gravity: 1.01 }],
    },
  ]),
)
const NOW = '2026-10-16T09:00:00Z'
const CASES = [
  ['status', {}],
  ['alerts', {}],
  ['alerts', { NO_COLOR: '1' }],
  ['status', { BREW_UNITS: 'imperial' }],
  ['alerts', { BREW_UNITS: 'imperial', NO_COLOR: '1' }],
  ['status', { BREW_UNITS: 'metric' }],
  [
    'alerts',
    {
      BREW_ALERT_TEMP_MAX: '25',
      BREW_ALERT_DAYS_MAX: '40',
      BREW_ALERT_TEMP_MIN: '19',
      NO_COLOR: '1',
    },
  ],
  ['alerts', { BREW_ALERT_TEMP_MAX: '', BREW_ALERT_DAYS_MAX: '10', NO_COLOR: '' }],
  ['status', { BREW_DATA_DIR: other }],
  ['alerts', { BREW_DATA_DIR: other, NO_COLOR: 'yes' }],
  ['status', { BREW_DATA_DIR: '' }],
  ['status', { BREW_UNITS: 'kelvin' }],
  ['alerts', { BREW_UNITS: '' }],
  ['status', { BREW_ALERT_TEMP_MAX: '18' }],
]
const GOLDEN = [
  '05c94654bc88c598',
  '854181e02190a32d',
  '3ed7a611bca0dbde',
  '506c8d9143288500',
  'ff1630c0ca5b4d8e',
  '05c94654bc88c598',
  'd5a8e23da8918ad9',
  '3bbb17b7a4d8e585',
  '6001860668cd7991',
  'a4d2a1f2b8e959c6',
  '05c94654bc88c598',
  '591d8565d1891037',
  '3a708030d9a00ba5',
  '11b71d7e2fd7ff7b',
]
try {
  const actual = CASES.map(([command, env]) => {
    const run = spawnSync(process.execPath, ['bin/brew.mjs', command], {
      cwd: dir,
      encoding: 'utf8',
      env: { PATH: process.env.PATH, BREW_NOW: NOW, ...env },
    })
    const record = JSON.stringify([run.status, run.stdout, run.stderr.split('\n')[0]])
    return createHash('sha256').update(record).digest('hex').slice(0, 16)
  })
  CASES.forEach(([command, env], i) =>
    assert.equal(actual[i], GOLDEN[i], `brew ${command} with ${JSON.stringify(env)}`),
  )
} finally {
  rmSync(other, { recursive: true, force: true })
}
const walk = (folder) =>
  readdirSync(folder, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(folder, entry.name)) : [join(folder, entry.name)],
  )
for (const file of [...walk(join(dir, 'src')), ...walk(join(dir, 'bin'))]) {
  if (file.endsWith(join('src', 'config.mjs'))) continue
  const text = readFileSync(file, 'utf8').replace(/loadConfig\(\s*process\.env\s*\)/g, '')
  assert.doesNotMatch(text, /process\.env|\benv\b\s*[.[]/, `${file} still reads the environment`)
  assert.doesNotMatch(
    text,
    /import\s*\{[^}]*\benv\b[^}]*\}\s*from\s*'node:process'/,
    `${file} imports env`,
  )
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
