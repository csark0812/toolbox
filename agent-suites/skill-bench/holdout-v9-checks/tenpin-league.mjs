// Hidden acceptance for scoreGame and --bowler: scoreGame totals a ten-frame sheet with strikes,
// spares, gutter balls and the tenth frame's bonus balls in either case, refuses broken sheets with
// a RangeError quoting the sheet and non-strings with a TypeError; the games command lists one
// bowler's games with scores, `?` for an unreadable sheet, a rounded-down average of the readable
// games, `games: ` on every stderr line, exit 2 for a missing or unknown name, and is unchanged
// without the option.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { scoreGame } = await import(pathToFileURL(join(dir, 'src/score.mjs')).href)
const nine = (frame, tenth) => `${Array(9).fill(frame).join(' ')} ${tenth}`
for (const [sheet, total] of [
  ['X X X X X X X X X XXX', 300],
  ['x x x x x x x x x xxx', 300],
  ['X 7/ 9- X -8 8/ -6 X X X81', 167],
  ['x 7/ 9- x -8 8/ -6 x x x81', 167],
  ['9/ X 8- 7/ X X 9- 8/ X XX9', 202],
  ['-/ X 9- 54 X X 72 8/ 6- 9/8', 152],
  ['8/ 9- x 7/ 9- x x 8- 9/ 7-', 154],
  [nine('--', '--'), 0],
  [nine('9-', '9-'), 90],
  [nine('5/', '5/5'), 150],
  [nine('1/', '1/1'), 110],
  [nine('-/', '-/-'), 100],
  [nine('9-', 'X9/'), 101],
  [nine('9-', 'X9-'), 100],
  [nine('9-', 'XX9'), 110],
  [nine('9-', 'XX-'), 101],
  [nine('9-', 'X-/'), 101],
  [nine('9-', '-/X'), 101],
  [nine('X', '9/X'), 279],
  [nine('X', 'X-8'), 278],
])
  assert.equal(scoreGame(sheet), total, sheet)
for (const sheet of [
  '',
  '300',
  '90',
  'X',
  nine('X', 'X'),
  nine('X', 'X55'),
  nine('9-', 'X5'),
  nine('9-', 'X5X'),
  nine('9-', 'XX/'),
  nine('9-', '81X'),
  nine('9-', '9/'),
  nine('9-', '9/XX'),
  nine('9-', 'XXXX'),
  nine('9-', '91'),
  nine('9-', '9- 9-'),
  `${Array(8).fill('9-').join(' ')} 9-`,
  `55 ${Array(9).fill('9-').join(' ')}`,
  `/5 ${Array(9).fill('9-').join(' ')}`,
  `X/ ${Array(9).fill('9-').join(' ')}`,
  `-X ${Array(9).fill('9-').join(' ')}`,
  `A- ${Array(9).fill('9-').join(' ')}`,
  `XX ${Array(8).fill('9-').join(' ')} 9-`,
  Array(10).fill('X').join(','),
])
  assert.throws(
    () => scoreGame(sheet),
    (error) => error instanceof RangeError && error.message.includes(sheet),
    `${JSON.stringify(sheet)} is refused with a RangeError quoting it`,
  )
for (const value of [300, null, undefined, ['X'], {}, true])
  assert.throws(() => scoreGame(value), TypeError, `${String(value)} is refused with a TypeError`)

const run = (...args) =>
  spawnSync(process.execPath, ['bin/games.mjs', ...args], { cwd: dir, encoding: 'utf8' })
const all = [
  '2026-09-03  Ann Price   X 7/ 9- X -8 8/ -6 X X X81',
  '2026-09-03  Ben Okoro   9- 8- 7/ 6- X 5/ 9- 8- 7- 9/X',
  '2026-09-03  Cara Singh  X X X X X X X X X XXX',
  '2026-09-03  Dev Shah    9- 9- 9- 9- 9- 9- 9- 9- 9- 9-',
  '2026-09-10  Ben Okoro   X X X X X X X X X X',
  '2026-09-10  Dev Shah    7/ 8- X 9/ -9 X 6/ 8- X X55',
  '2026-09-10  Ann Price   9/ X 8- 7/ X X 9- 8/ X XX9',
  '2026-09-17  Cara Singh  5/ 5/ 5/ 5/ 5/ 5/ 5/ 5/ 5/ 5/5',
  '2026-09-17  Ben Okoro   8/ 9- X 7/ 9- X X 8- 9/ 7-',
  '2026-09-17  Dev Shah    -/ X 9- 54 X X 72 8/ 6- 9/8',
]
const plain = run()
assert.equal(plain.stdout, all.join('\n') + '\n', 'without the option the list is unchanged')
assert.equal(plain.status, 0)
const stderrLines = (result) => result.stderr.split('\n').filter((line) => line.trim())
for (const [name, lines, unreadable] of [
  ['Ann Price', [`${all[0]}  167`, `${all[6]}  202`, 'Average: 184'], []],
  [
    'ben okoro',
    [`${all[1]}  122`, `${all[4]}  ?`, `${all[8]}  154`, 'Average: 138'],
    ['2026-09-10'],
  ],
  [
    '  Dev Shah ',
    [`${all[3]}  90`, `${all[5]}  ?`, `${all[9]}  152`, 'Average: 121'],
    ['2026-09-10'],
  ],
  ['CARA SINGH', [`${all[2]}  300`, `${all[7]}  150`, 'Average: 225'], []],
]) {
  const result = run('--bowler', name)
  assert.equal(result.status, 0, `--bowler ${name} exits 0`)
  assert.equal(result.stdout, lines.join('\n') + '\n', `--bowler ${JSON.stringify(name)}`)
  const errors = stderrLines(result)
  assert.equal(errors.length >= unreadable.length, true, `unreadable games for ${name} are named`)
  for (const line of errors) assert.match(line, /^games: /, `stderr lines start with "games: "`)
  for (const night of unreadable)
    assert.ok(
      errors.some((line) => line.includes(night) || line.includes('X X X X X X X X X X')),
      `the unreadable game on ${night} is named on stderr`,
    )
}
for (const args of [
  ['--bowler'],
  ['--bowler', 'Zed Quinn'],
  ['--bowler', ''],
  ['--bowler', '   '],
]) {
  const result = run(...args)
  assert.equal(result.status, 2, `${JSON.stringify(args)} exits 2`)
  assert.equal(result.stdout, '', `${JSON.stringify(args)} prints nothing on stdout`)
  const errors = stderrLines(result)
  assert.ok(errors.length > 0, `${JSON.stringify(args)} explains itself on stderr`)
  for (const line of errors) assert.match(line, /^games: /, `stderr lines start with "games: "`)
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
