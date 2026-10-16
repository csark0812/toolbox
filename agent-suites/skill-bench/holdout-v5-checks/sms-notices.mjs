// Hidden acceptance for segments() and --max-segments: GSM-7 vs UCS-2 choice, extension
// characters as two units, UTF-16 code units for UCS-2, the 160/153 and 70/67 limits, and the
// preview's segment line, refusal and exit codes. Splits where an escape pair or a surrogate pair
// meets a segment boundary are left to the implementer and not pinned.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { segments } = await import(pathToFileURL(join(dir, 'src/segments.mjs')).href)
const a = (n) => 'a'.repeat(n)
const zh = (n) => 'ж'.repeat(n)
const cases = [
  ['Hello', 'GSM-7', 5, 1],
  [a(160), 'GSM-7', 160, 1],
  [a(161), 'GSM-7', 161, 2],
  [a(306), 'GSM-7', 306, 2],
  [a(307), 'GSM-7', 307, 3],
  ['€', 'GSM-7', 2, 1],
  ['[x]', 'GSM-7', 5, 1],
  [`${a(158)}€`, 'GSM-7', 160, 1],
  [`${a(159)}€`, 'GSM-7', 161, 2],
  ['Café Ç\n¿Sí?', 'UCS-2', 11, 1],
  ['Café Ç\n¿Si?', 'GSM-7', 11, 1],
  ['Привет', 'UCS-2', 6, 1],
  [zh(70), 'UCS-2', 70, 1],
  [zh(71), 'UCS-2', 71, 2],
  [zh(134), 'UCS-2', 134, 2],
  [zh(135), 'UCS-2', 135, 3],
  ['👍', 'UCS-2', 2, 1],
  ['ok 👍', 'UCS-2', 5, 1],
  [`${a(69)}ç`, 'UCS-2', 70, 1],
  [`${a(150)}€`, 'GSM-7', 152, 1],
]
for (const [text, encoding, units, count] of cases) {
  const got = segments(text)
  const label = `segments(${JSON.stringify(text.length > 20 ? `${text.slice(0, 8)}…(${text.length})` : text)})`
  assert.equal(got.encoding, encoding, `${label}.encoding`)
  assert.equal(got.units, units, `${label}.units`)
  assert.equal(got.segments, count, `${label}.segments`)
}
const notice = (...args) =>
  spawnSync(process.execPath, ['bin/notice.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const short = ['ready', 'name=Ana', 'code=KX', 'locker=B', 'date=Friday', 'pin=ab']
const long = [
  'reminder',
  'code=KX',
  'locker=Market Street north entrance beside the old bakery',
  'date=Friday',
]
const lines = (run) => run.stdout.split('\n')
let run = notice(...short)
assert.equal(run.status, 0)
assert.equal(
  lines(run)[0],
  'Hi Ana, your parcel KX is ready at locker B. Collect it by Friday with PIN ab.',
)
assert.match(lines(run).slice(1).join('\n'), /GSM-7/, 'the encoding is shown')
assert.match(lines(run).slice(1).join('\n'), /\b1\b/, 'the segment count is shown')
run = notice(...long)
assert.equal(run.status, 0, 'no limit unless asked')
assert.match(lines(run).slice(1).join('\n'), /\b2\b/, 'the long reminder takes two segments')
run = notice(...long, '--max-segments', '1')
assert.equal(run.status, 1, 'a message over the limit is refused')
assert.equal(run.stdout, '', 'nothing is printed as sendable')
assert.match(run.stderr, /\b2\b/, 'the refusal says how many segments it needs')
run = notice(...long, '--max-segments', '2')
assert.equal(run.status, 0)
run = notice(
  'ready-es',
  'name=Ana',
  'code=KX',
  'locker=B',
  'date=viernes',
  'pin=ab',
  '--max-segments',
  '2',
)
assert.equal(run.status, 0)
assert.match(lines(run).slice(1).join('\n'), /UCS-2/)
assert.match(lines(run).slice(1).join('\n'), /\b2\b/, 'the Spanish notice needs two UCS-2 segments')
for (const bad of ['0', 'two', '1.5', '-1'])
  assert.equal(notice(...short, '--max-segments', bad).status, 2, `--max-segments ${bad} exits 2`)
const tests = readdirSync(join(dir, 'tests'))
  .map((name) => readFileSync(join(dir, 'tests', name), 'utf8'))
  .join('\n')
assert.match(tests, /segments\(/, 'segments() ships with its own tests')
assert.match(tests, /--max-segments/, 'the option ships with its own tests')
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
