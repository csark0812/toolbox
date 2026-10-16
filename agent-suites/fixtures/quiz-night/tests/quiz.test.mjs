import assert from 'node:assert/strict'
import { mkdirSync, readFileSync, rmSync } from 'node:fs'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { TEAMS } from '../src/paths.mjs'
import { withRetry } from '../src/retry.mjs'
import { placed, roundResults, totals } from '../src/standings.mjs'
import { loadTeams, savePoints } from '../src/teams.mjs'

const POINTS = fileURLToPath(new URL('../data/points.json', import.meta.url))
const scratch = fileURLToPath(new URL('./.scratch/', import.meta.url))
mkdirSync(scratch, { recursive: true })
after(() => rmSync(scratch, { recursive: true, force: true }))

test('loads the teams', (t, done) => {
  loadTeams(TEAMS, (error, teams) => {
    assert.equal(error, null)
    assert.equal(teams.length, 5)
    done()
  })
})

test('a missing team file is an error', (t, done) => {
  loadTeams(`${scratch}missing.json`, (error) => {
    assert.equal(error.code, 'ENOENT')
    done()
  })
})

test('saves the points sheet', (t, done) => {
  const file = `${scratch}points.json`
  savePoints(file, { rounds: { 1: { a: 3 } } }, (error) => {
    assert.ifError(error)
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), { rounds: { 1: { a: 3 } } })
    done()
  })
})

test('retries while the file is busy', (t, done) => {
  let calls = 0
  const flaky = (value, callback) =>
    ++calls < 3
      ? callback(Object.assign(new Error('busy'), { code: 'EBUSY' }))
      : callback(null, value)
  withRetry(flaky, ['ok'], 3, (error, value) => {
    assert.equal(value, 'ok')
    assert.equal(calls, 3)
    done()
  })
})

test('shared places for equal points', () => {
  assert.deepEqual(
    placed([
      { name: 'B', points: 5 },
      { name: 'A', points: 7 },
      { name: 'C', points: 5 },
    ]).map((entry) => `${entry.place} ${entry.name}`),
    ['1 A', '2 B', '2 C'],
  )
})

test('totals and rounds', async () => {
  assert.equal((await totals(TEAMS, POINTS))[0].name, 'Quiz Team Aguilera')
  assert.equal((await roundResults(TEAMS, POINTS, '3'))[0].points, 10)
  await assert.rejects(roundResults(TEAMS, POINTS, '9'), RangeError)
})
