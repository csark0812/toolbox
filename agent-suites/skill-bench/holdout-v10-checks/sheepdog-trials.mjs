// Hidden acceptance for moving the judges' feed off events: readRuns(path) returns a promise (no
// emitter, no on/once left anywhere), rejects for an unreadable file, and scores, leaderboard and
// count print byte-for-byte what they did on stdout, on stderr, interleaved as an operator sees
// them, and with the same exit codes: the runs read before a broken line still print, the skip
// warnings sit between the runs, --strict still exits 2, across many feed files.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]

const tmp = '.feeds'
mkdirSync(join(dir, tmp), { recursive: true })
const run = (handler, dog, cls, points) => JSON.stringify({ handler, dog, class: cls, points })
const files = {
  'empty.jsonl': '',
  'blank.jsonl': '\n\n  \n',
  'crlf.jsonl':
    [
      run('Ann Bell', 'Jess', 'open', 77),
      run('Rob Hay', 'Fly', 'novice', 'retired'),
      run('Di Cole', 'Ben', 'open', 90),
    ].join('\r\n') + '\r\n',
  'skips.jsonl': [run('A B', 'X', 'open', 'dq'), run('C D', 'Y', 'novice', false)].join('\n'),
  'first-broken.jsonl': '{"handler":\n' + run('E F', 'Z', 'open', 50) + '\n',
  'last-broken.jsonl': [
    run('G H', 'Rex', 'novice', 66),
    run('I J', 'Meg', 'novice', 'dq'),
    run('K L', 'Tib', 'open', 81),
    '{"handler":"M N","dog":"Q',
  ].join('\n'),
  'ties.jsonl':
    [
      run('P1', 'D1', 'open', 70),
      run('P2', 'D2', 'open', 85),
      run('P3', 'D3', 'open', 70),
      run('P4', 'D4', 'open', 70),
      run('P5', 'D5', 'novice', 'retired'),
    ].join('\n') + '\n',
}
for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, tmp, name), text)
const feeds = [
  'data/runs.jsonl',
  'data/broken.jsonl',
  'missing.jsonl',
  'data',
  ...Object.keys(files).map((name) => `${tmp}/${name}`),
]
const cases = [
  ['scores'],
  ['leaderboard'],
  ['count'],
  ['leaderboard', 'open'],
  ['leaderboard', '--strict'],
]
for (const feed of feeds) {
  cases.push(['scores', feed], ['count', feed], ['leaderboard', feed])
  for (const extra of [
    ['open'],
    ['novice'],
    ['hunt'],
    ['--strict'],
    ['open', '--strict'],
    ['--strict', 'novice'],
  ])
    cases.push(['leaderboard', feed, ...extra])
}
const actual = {}
const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16)
try {
  for (const [script, ...args] of cases) {
    const r = spawnSync(process.execPath, [`bin/${script}.mjs`, ...args], {
      cwd: dir,
      encoding: 'utf8',
      timeout: 15000,
    })
    const both = spawnSync(
      'sh',
      ['-c', `"${process.execPath}" bin/${script}.mjs "$@" 2>&1`, 'sh', ...args],
      {
        cwd: dir,
        encoding: 'utf8',
        timeout: 15000,
      },
    )
    const key = [script, ...args].join(' ')
    actual[key] = hash(`${r.status}\0${r.stdout}\0${r.stderr}\0${both.stdout}`)
    if (!process.env.RECORD && expected()[key] !== actual[key])
      assert.fail(
        `${key}: output changed\nstdout:\n${r.stdout}\nstderr:\n${r.stderr}\nas seen in a terminal:\n${both.stdout}\nexit ${r.status}`,
      )
  }
} finally {
  rmSync(join(dir, tmp), { recursive: true, force: true })
}
if (process.env.RECORD) {
  console.log(JSON.stringify(actual, null, 2))
  process.exit(0)
}
assert.equal(Object.keys(actual).length, Object.keys(expected()).length)

const { readRuns } = await import(pathToFileURL(join(dir, 'src/feed.mjs')).href)
const pending = readRuns(join(dir, 'data/runs.jsonl'))
assert.equal(typeof pending?.then, 'function', 'readRuns returns a promise')
assert.notEqual(typeof pending.on, 'function', 'readRuns no longer returns an emitter')
await pending
await assert.rejects(readRuns(join(dir, 'no-such-file.jsonl')), { code: 'ENOENT' })
await readRuns(join(dir, 'data/broken.jsonl')).catch(() => {})
for (const sub of ['src', 'bin', 'tests'])
  for (const file of readdirSync(join(dir, sub), { recursive: true })) {
    if (!/\.m?js$/.test(file)) continue
    const text = readFileSync(join(dir, sub, file), 'utf8')
    assert.doesNotMatch(
      text,
      /EventEmitter|\.on\(\s*['"]|\bonce\(|\.emit\(/,
      `${sub}/${file} still uses the event API`,
    )
  }
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

function expected() {
  return {
    scores: '910405f570da351a',
    leaderboard: '8bcf785fbad29204',
    count: 'b03d078a689c2cff',
    'leaderboard open': '8bcf785fbad29204',
    'leaderboard --strict': '75b63abf559fc8d3',
    'scores data/runs.jsonl': '910405f570da351a',
    'count data/runs.jsonl': 'b03d078a689c2cff',
    'leaderboard data/runs.jsonl': '8bcf785fbad29204',
    'leaderboard data/runs.jsonl open': '8bcf785fbad29204',
    'leaderboard data/runs.jsonl novice': 'ee21e851bda9ea4d',
    'leaderboard data/runs.jsonl hunt': 'b01782ae3378fc85',
    'leaderboard data/runs.jsonl --strict': '75b63abf559fc8d3',
    'leaderboard data/runs.jsonl open --strict': '75b63abf559fc8d3',
    'leaderboard data/runs.jsonl --strict novice': '4c100125d8b742fe',
    'scores data/broken.jsonl': '75755e15484f5338',
    'count data/broken.jsonl': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl open': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl novice': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl hunt': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl --strict': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl open --strict': '4503366bbdb1e936',
    'leaderboard data/broken.jsonl --strict novice': '4503366bbdb1e936',
    'scores missing.jsonl': 'fce63a945ac3bfda',
    'count missing.jsonl': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl open': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl novice': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl hunt': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl --strict': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl open --strict': 'fce63a945ac3bfda',
    'leaderboard missing.jsonl --strict novice': 'fce63a945ac3bfda',
    'scores data': '38c9e650c8a50c98',
    'count data': '38c9e650c8a50c98',
    'leaderboard data': 'e6ecab13d7ede585',
    'leaderboard data open': '213f4abf68c16b3a',
    'leaderboard data novice': 'feb96b9dc1f2e95e',
    'leaderboard data hunt': 'f2a8e3374be48b78',
    'leaderboard data --strict': 'e1a487fb1491a95e',
    'leaderboard data open --strict': '213f4abf68c16b3a',
    'leaderboard data --strict novice': 'feb96b9dc1f2e95e',
    'scores .feeds/empty.jsonl': '102119dbd5ba76b4',
    'count .feeds/empty.jsonl': 'dd442dd763aff7f1',
    'leaderboard .feeds/empty.jsonl': 'ea3e5d856bb7a387',
    'leaderboard .feeds/empty.jsonl open': '0c73cf76894b26c8',
    'leaderboard .feeds/empty.jsonl novice': 'f2996958361a2e30',
    'leaderboard .feeds/empty.jsonl hunt': 'b01782ae3378fc85',
    'leaderboard .feeds/empty.jsonl --strict': 'ea3e5d856bb7a387',
    'leaderboard .feeds/empty.jsonl open --strict': '0c73cf76894b26c8',
    'leaderboard .feeds/empty.jsonl --strict novice': 'f2996958361a2e30',
    'scores .feeds/blank.jsonl': '102119dbd5ba76b4',
    'count .feeds/blank.jsonl': 'dd442dd763aff7f1',
    'leaderboard .feeds/blank.jsonl': 'ea3e5d856bb7a387',
    'leaderboard .feeds/blank.jsonl open': '0c73cf76894b26c8',
    'leaderboard .feeds/blank.jsonl novice': 'f2996958361a2e30',
    'leaderboard .feeds/blank.jsonl hunt': 'b01782ae3378fc85',
    'leaderboard .feeds/blank.jsonl --strict': 'ea3e5d856bb7a387',
    'leaderboard .feeds/blank.jsonl open --strict': '0c73cf76894b26c8',
    'leaderboard .feeds/blank.jsonl --strict novice': 'f2996958361a2e30',
    'scores .feeds/crlf.jsonl': '64e845a6e39a8f02',
    'count .feeds/crlf.jsonl': '2ecf4dca266a007d',
    'leaderboard .feeds/crlf.jsonl': '129a215ce8fef880',
    'leaderboard .feeds/crlf.jsonl open': '129a215ce8fef880',
    'leaderboard .feeds/crlf.jsonl novice': 'f2996958361a2e30',
    'leaderboard .feeds/crlf.jsonl hunt': 'b01782ae3378fc85',
    'leaderboard .feeds/crlf.jsonl --strict': '4144c65f62323b97',
    'leaderboard .feeds/crlf.jsonl open --strict': '4144c65f62323b97',
    'leaderboard .feeds/crlf.jsonl --strict novice': 'd9d18d9fc86306e1',
    'scores .feeds/skips.jsonl': '7971b98a0be84fee',
    'count .feeds/skips.jsonl': 'dd442dd763aff7f1',
    'leaderboard .feeds/skips.jsonl': 'ea3e5d856bb7a387',
    'leaderboard .feeds/skips.jsonl open': '0c73cf76894b26c8',
    'leaderboard .feeds/skips.jsonl novice': 'f2996958361a2e30',
    'leaderboard .feeds/skips.jsonl hunt': 'b01782ae3378fc85',
    'leaderboard .feeds/skips.jsonl --strict': 'f1f3e058dc72a54e',
    'leaderboard .feeds/skips.jsonl open --strict': '147e94ad7d5444f0',
    'leaderboard .feeds/skips.jsonl --strict novice': '7a05e904be44a5f7',
    'scores .feeds/first-broken.jsonl': 'a4ac8c239425beef',
    'count .feeds/first-broken.jsonl': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl open': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl novice': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl hunt': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl --strict': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl open --strict': 'a4ac8c239425beef',
    'leaderboard .feeds/first-broken.jsonl --strict novice': 'a4ac8c239425beef',
    'scores .feeds/last-broken.jsonl': '9f3e94bec64a13be',
    'count .feeds/last-broken.jsonl': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl open': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl novice': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl hunt': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl --strict': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl open --strict': '4503366bbdb1e936',
    'leaderboard .feeds/last-broken.jsonl --strict novice': '4503366bbdb1e936',
    'scores .feeds/ties.jsonl': '30a81332a83a44db',
    'count .feeds/ties.jsonl': '0e65476bef348bc4',
    'leaderboard .feeds/ties.jsonl': '594463448f0e68b1',
    'leaderboard .feeds/ties.jsonl open': '594463448f0e68b1',
    'leaderboard .feeds/ties.jsonl novice': 'f2996958361a2e30',
    'leaderboard .feeds/ties.jsonl hunt': 'b01782ae3378fc85',
    'leaderboard .feeds/ties.jsonl --strict': '6ca3a27293c6d1ed',
    'leaderboard .feeds/ties.jsonl open --strict': '6ca3a27293c6d1ed',
    'leaderboard .feeds/ties.jsonl --strict novice': 'd9d18d9fc86306e1',
  }
}
