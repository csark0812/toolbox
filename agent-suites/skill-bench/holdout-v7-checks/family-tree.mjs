// Hidden acceptance for the kinship speed-up: the same nearest common ancestor (with the same
// tie-breaks) as the original search on random trees with cousin marriages, unknown ids still
// throw, the frozen timing script under target with the same work, and the work committed.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { kinship } = await import(pathToFileURL(join(dir, 'src/kinship.mjs')).href)

function reference(people, a, b) {
  const byId = new Map(people.map((p) => [p.id, p]))
  const walk = (id) => {
    if (!byId.has(id)) throw new Error(`no person ${id}`)
    const steps = new Map([[id, 0]])
    const queue = [id]
    for (let i = 0; i < queue.length; i++) {
      const person = byId.get(queue[i])
      for (const parent of [person.mother, person.father])
        if (parent && !steps.has(parent)) {
          steps.set(parent, steps.get(queue[i]) + 1)
          queue.push(parent)
        }
    }
    return steps
  }
  const [fromA, fromB] = [walk(a), walk(b)]
  let best = null
  for (const [id, up] of fromA) {
    const down = fromB.get(id)
    if (down === undefined) continue
    if (
      !best ||
      up + down < best.up + best.down ||
      (up + down === best.up + best.down &&
        (up < best.up || (up === best.up && id < best.ancestor)))
    )
      best = { ancestor: id, up, down }
  }
  return best
}
let seed = 13
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 200; round++) {
  const people = []
  const generations = []
  for (let g = 0; g < 1 + (next() % 6); g++) {
    const born = []
    for (let i = 0; i < 1 + (next() % 6); i++) {
      const previous = generations[g - 1]
      const person = {
        id: `Q${String(next() % 100000).padStart(5, '0')}${people.length}`,
        name: 'x',
      }
      person.mother = previous && next() % 4 ? previous[next() % previous.length].id : null
      person.father = previous && next() % 4 ? previous[next() % previous.length].id : null
      if (person.father === person.mother) person.father = null
      people.push(person)
      born.push(person)
    }
    generations.push(born)
  }
  people.sort(() => (next() % 3) - 1)
  const frozen = JSON.stringify(people)
  for (let q = 0; q < 6; q++) {
    const a = people[next() % people.length].id
    const b = people[next() % people.length].id
    assert.deepEqual(kinship(people, a, b), reference(people, a, b), `round ${round}: ${a} ${b}`)
  }
  assert.throws(() => kinship(people, people[0].id, 'NOPE'), 'an unknown id throws')
  assert.equal(JSON.stringify(people), frozen, "the caller's tree is not changed")
}
const run = (...args) =>
  execFileSync(process.execPath, ['bin/kin.mjs', ...args], { cwd: dir, encoding: 'utf8' })
assert.equal(
  run('P11', 'P12'),
  'Frank Hollins and Lily Lees: 1st cousin (through Mary Hollins, 2 up, 2 down)\n',
)
assert.equal(
  run('P09', 'P10'),
  'Edith Hollins and Arthur Lees: 1st cousin (through Thomas Hollins, 2 up, 2 down)\n',
)
assert.equal(run('P09', 'P13'), 'Edith Hollins and Henry Platt share no known ancestor.\n')
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 920, 'the same generations counted')
assert.equal(perf.related, 107, 'the same pairs related')
// Target is 10 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 20, `median ${perf.medianMs} ms is far above the 10 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
