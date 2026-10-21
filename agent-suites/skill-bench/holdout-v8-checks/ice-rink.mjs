// Hidden acceptance for the promise migration: loadSessions(path) returns a promise and has no
// callback form left, and every command (including the promisified report and the retrying
// busiest screen) prints exactly what it did, on stdout and stderr, with the same exit codes.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { loadSessions } = await import(pathToFileURL(join(dir, 'src/sessions.mjs')).href)
assert.ok(loadSessions.length <= 1, 'loadSessions takes only the path')
const data = join(dir, 'data/sessions.json')
const loaded = loadSessions(data)
assert.equal(typeof loaded?.then, 'function', 'loadSessions returns a promise')
const sessions = await loaded
assert.equal(sessions.length, 7)
assert.equal(sessions[1].type, 'lessons', 'types are still tidied')
await assert.rejects(loadSessions(join(dir, 'no-such-file.json')), { code: 'ENOENT' })
let called = false
const again = loadSessions(data, () => (called = true))
await again
await new Promise((resolve) => setTimeout(resolve, 100))
assert.equal(called, false, 'no callback form is left alongside the promise')

const broken = join(dir, '.broken-sessions.json')
writeFileSync(broken, '[{"id": "S1",')
const run = (script, ...args) =>
  spawnSync(process.execPath, [`bin/${script}.mjs`, ...args], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 15000,
  })
const same = (result, stdout, stderr, status, label) => {
  assert.equal(result.stdout, stdout, `${label}: stdout`)
  assert.equal(result.stderr, stderr, `${label}: stderr`)
  assert.equal(result.status, status, `${label}: exit code`)
}
try {
  same(
    run('today'),
    [
      '10:00-11:30  public skate   112/250  45%',
      '12:00-12:45  lessons         24/30  80%',
      '13:00-15:00  hockey          38/40  95%',
      '19:00-21:00  disco          231/250  92%',
      '',
    ].join('\n'),
    '',
    0,
    'today',
  )
  same(
    run('today', 'data/sessions.json', '2026-11-10'),
    'No sessions on 2026-11-10.\n',
    '',
    0,
    'empty day',
  )
  same(
    run('today', 'missing.json'),
    '',
    'Could not read missing.json: ENOENT\n',
    1,
    'today missing',
  )
  same(
    run('report'),
    [
      'public skate    363 of 750',
      'disco           231 of 250',
      'lessons          54 of 60',
      'hockey           38 of 40',
      '',
    ].join('\n'),
    '',
    0,
    'report',
  )
  same(
    run('report', 'missing.json'),
    '',
    'Could not read missing.json: ENOENT\n',
    1,
    'report missing',
  )
  same(run('busiest'), 'Busiest: 2026-11-08 12:00 lessons, 100% full\n', '', 0, 'busiest')
  same(
    run('busiest', 'missing.json'),
    '',
    'Retrying (attempt 2 of 3)\nRetrying (attempt 3 of 3)\nCould not read missing.json: ENOENT\n',
    1,
    'busiest missing',
  )
  for (const script of ['today', 'report', 'busiest']) {
    const result = run(script, '.broken-sessions.json')
    assert.equal(result.status, 1, `${script} on a half-written export exits 1`)
    assert.equal(result.stdout, '', `${script} on a half-written export prints nothing`)
    assert.match(result.stderr, /Could not read \.broken-sessions\.json: /)
  }
} finally {
  rmSync(broken, { force: true })
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
