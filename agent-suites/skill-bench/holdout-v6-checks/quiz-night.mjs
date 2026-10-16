// Hidden acceptance for the promise migration: the file helpers return promises with the same
// values and errors and no callback parameter, and every command prints and writes exactly what
// it did before (including the retrying save and the promisified readers).
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const teamsModule = await import(pathToFileURL(join(dir, 'src/teams.mjs')).href)
const { loadTeams, loadPoints, savePoints } = teamsModule
const scratch = join(dir, '.check-scratch')
mkdirSync(scratch, { recursive: true })
try {
  assert.ok(loadTeams.length <= 1, 'loadTeams takes no callback')
  assert.ok(loadPoints.length <= 1, 'loadPoints takes no callback')
  assert.ok(savePoints.length <= 2, 'savePoints takes no callback')
  const teams = loadTeams(join(dir, 'data/teams.json'))
  assert.equal(typeof teams?.then, 'function', 'loadTeams returns a promise')
  assert.equal((await teams).length, 5)
  assert.equal(Object.keys((await loadPoints(join(dir, 'data/points.json'))).rounds).length, 3)
  await assert.rejects(loadTeams(join(scratch, 'missing.json')), (e) => e.code === 'ENOENT')
  writeFileSync(join(scratch, 'broken.json'), '{ nope')
  await assert.rejects(loadTeams(join(scratch, 'broken.json')), SyntaxError)
  const saved = savePoints(join(scratch, 'saved.json'), { rounds: { 1: { a: 3 } } })
  assert.equal(typeof saved?.then, 'function', 'savePoints returns a promise')
  await saved
  assert.equal(
    readFileSync(join(scratch, 'saved.json'), 'utf8'),
    '{\n  "rounds": {\n    "1": {\n      "a": 3\n    }\n  }\n}\n',
  )

  const run = (args, env = {}) =>
    spawnSync(process.execPath, args, {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, ...env },
      timeout: 10000,
    })
  let result = run(['bin/leaderboard.mjs'])
  assert.equal(
    result.stdout,
    [
      ' 1. Quiz Team Aguilera        25',
      ' 2. The Spice Spaniels        23',
      ' 3. Agatha Quiztie            22',
      ' 3. Universally Challenged    22',
      ' 5. Tequila Mockingbird       16',
      '',
    ].join('\n'),
    'leaderboard',
  )
  result = run(['bin/round.mjs', '2'])
  assert.equal(
    result.stdout,
    [
      'Round 2',
      ' 1. Universally Challenged     9',
      ' 2. Quiz Team Aguilera         8',
      ' 3. Tequila Mockingbird        7',
      ' 4. Agatha Quiztie             6',
      ' 4. The Spice Spaniels         6',
      '',
    ].join('\n'),
    'round 2',
  )
  result = run(['bin/round.mjs', '9'])
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'round: no points for round 9\n')
  result = run(['bin/leaderboard.mjs'], { QUIZ_POINTS: join(scratch, 'missing.json') })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /^leaderboard: ENOENT/)

  const sheet = join(scratch, 'points.json')
  copyFileSync(join(dir, 'data/points.json'), sheet)
  result = run(['bin/record.mjs', '4', 'tequila', '9'], { QUIZ_POINTS: sheet })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.stdout, 'Round 4: Tequila Mockingbird 9\n', 'record confirms the save')
  const written = readFileSync(sheet, 'utf8')
  assert.deepEqual(JSON.parse(written).rounds['4'], { tequila: 9 })
  assert.equal(written, `${JSON.stringify(JSON.parse(written), null, 2)}\n`, 'same file format')
  result = run(['bin/record.mjs', '4', 'agatha', '6'], { QUIZ_POINTS: sheet })
  assert.deepEqual(JSON.parse(readFileSync(sheet, 'utf8')).rounds['4'], { tequila: 9, agatha: 6 })
  result = run(['bin/record.mjs', '4', 'nobody', '6'], { QUIZ_POINTS: sheet })
  assert.equal(result.status, 1)
  assert.equal(result.stderr, 'record: unknown team "nobody"\n')
  result = run(['bin/record.mjs', '4', 'agatha', '6'], { QUIZ_POINTS: join(scratch, 'none.json') })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /^record: ENOENT/)
  result = run(['bin/record.mjs', '4', 'agatha'])
  assert.equal(result.status, 2)
  assert.equal(
    readFileSync(join(dir, 'data/points.json'), 'utf8').includes('"4"'),
    false,
    'the real sheet is untouched',
  )

  // No callback-era plumbing is left around the helpers.
  const sources = ['src/standings.mjs', 'bin/record.mjs']
    .map((file) => readFileSync(join(dir, file), 'utf8'))
    .join('\n')
  assert.doesNotMatch(sources, /promisify\(\s*(loadTeams|loadPoints|savePoints)/, 'no promisify')
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
