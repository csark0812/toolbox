// Hidden acceptance for the results speed-up: the same results as the original on random events
// (controls repeated within a course and punched out of order or twice, missing controls, no finish
// or a finish left out, runs past midnight and clocks with stray spaces, equal times sharing places
// and leg ranks, mispunches and non-finishers whose legs are not ranked and do not count against
// anyone, equal or accented names going by localeCompare and then bib, runners on unknown courses
// and empty courses), the caller's data left alone, the frozen timing script under target with
// the same work, and the work committed on the branch.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { results } = await import(pathToFileURL(join(dir, 'src/results.mjs')).href)

const DAY = 24 * 60 * 60

/** Seconds since midnight for a clock time read off the e-punching download, like "10:04:37". */
function clock(time) {
  const date = new Date(`1970-01-01T${time.trim()}Z`)
  return date.getUTCHours() * 3600 + date.getUTCMinutes() * 60 + date.getUTCSeconds()
}

/** Seconds after the runner's start. Night events run past midnight, so a clock earlier than the start is the next day. */
function sinceStart(runner, time) {
  const elapsed = clock(time) - clock(runner.start)
  return elapsed < 0 ? elapsed + DAY : elapsed
}

/**
 * How a runner did on their course: the controls are found in course order among the punches
 * (extra punches are fine), giving the time for each leg, and then the finish.
 */
function analyse(runner, course) {
  const splits = []
  let previous = 0
  let from = 0
  let missing = false
  for (const code of course.controls) {
    const at = runner.punches.findIndex((punch, i) => i >= from && punch.code === code)
    if (at < 0) {
      missing = true
      break
    }
    const reached = sinceStart(runner, runner.punches[at].time)
    splits.push(reached - previous)
    previous = reached
    from = at + 1
  }
  if (runner.finish == null) return { status: 'DNF', time: null, splits }
  if (missing) return { status: 'MP', time: null, splits }
  const time = sinceStart(runner, runner.finish)
  splits.push(time - previous)
  return { status: 'OK', time, splits }
}

const ORDER = { OK: 0, MP: 1, DNF: 2 }

/** Results for every course, in course order: finishers by time with shared places, then mispunches, then non-finishers. */
function reference(courses, runners) {
  return courses.map((course) => {
    const entrants = runners.filter((runner) => runner.course === course.id)
    const sorted = [...entrants].sort((a, b) => {
      const x = analyse(a, course)
      const y = analyse(b, course)
      return (
        ORDER[x.status] - ORDER[y.status] ||
        (x.status === 'OK' ? x.time - y.time : 0) ||
        a.name.localeCompare(b.name) ||
        a.bib - b.bib
      )
    })
    const finishers = sorted.filter((runner) => analyse(runner, course).status === 'OK')
    const analysed = finishers.map((runner) => analyse(runner, course))
    const winner = analysed[0]?.time ?? null
    return {
      course: course.id,
      results: sorted.map((runner) => {
        const mine = analyse(runner, course)
        const ok = mine.status === 'OK'
        return {
          bib: runner.bib,
          name: runner.name,
          club: runner.club,
          status: mine.status,
          time: mine.time,
          place: ok ? 1 + analysed.filter((other) => other.time < mine.time).length : null,
          behind: ok ? mine.time - winner : null,
          splits: mine.splits.map((time, leg) => ({
            time,
            rank: ok ? 1 + analysed.filter((other) => other.splits[leg] < time).length : null,
          })),
        }
      }),
    }
  })
}

let seed = 83
const next = () => (seed = (seed * 48271) % 2147483647)
const pick = (list) => list[next() % list.length]
const CLOCKS = [
  '23:58:00',
  '23:59:30',
  ' 00:00:00',
  '00:00:00',
  '00:01:15 ',
  '00:03:00',
  '10:00:00',
  '10:02:00',
]
const NAMES = ['Ana', 'ana', 'Émile', 'Emile', 'Bea Ince', 'Zed', 'Ana']
for (let round = 0; round < 400; round++) {
  const courses = Array.from({ length: 1 + (next() % 3) }, (_, i) => ({
    id: ['Blue', 'Green', 'Brown'][i],
    controls: Array.from({ length: next() % 5 }, () => 31 + (next() % 4)),
  }))
  const runners = Array.from({ length: next() % 11 }, () => {
    const runner = {
      bib: 1 + (next() % 9),
      name: pick(NAMES),
      club: pick(['SROC', 'DEE']),
      course: pick(['Blue', 'Green', 'Brown', 'Nope']),
      start: pick(CLOCKS),
      punches: Array.from({ length: next() % 7 }, () => ({
        code: 31 + (next() % 5),
        time: pick(CLOCKS),
      })),
    }
    const finish = next() % 6
    if (finish === 1) runner.finish = null
    else if (finish > 1) runner.finish = pick(CLOCKS)
    return runner
  })
  const frozen = JSON.stringify({ courses, runners })
  assert.deepEqual(
    results(courses, runners),
    reference(courses, runners),
    `round ${round}: ${frozen}`,
  )
  assert.equal(JSON.stringify({ courses, runners }), frozen, "the caller's data is not changed")
}

assert.equal(
  execFileSync(process.execPath, ['bin/results.mjs'], { cwd: dir, encoding: 'utf8' }),
  [
    'Blue (4)',
    '  1  Bea Ince     HAVOC    29:40         4:40 (2)  5:50 (1)  6:35 (1)  8:15 (1)  4:20 (1)',
    '  1  Huw Fell     SROC     29:40         4:10 (1)  6:20 (2)  6:35 (1)  8:15 (1)  4:20 (1)',
    '     Cal Pyle     WAOC        MP         4:00',
    '     Ana Rowe     SROC       DNF         5:00  6:00',
    'Yellow (2)',
    '  1  Dana Moor    DEE      18:30         7:00 (1)  8:00 (1)  3:30 (1)',
    '  1  Eli Tarn     BOK      18:30         7:00 (1)  8:00 (1)  3:30 (1)',
    'White (0)',
    '',
  ].join('\n'),
)
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 1280, 'every runner on a listed course')
assert.equal(perf.finishers, 1215, 'the same finishers')
assert.equal(perf.splits, 22183, 'the same leg times')
assert.deepEqual(perf.winners, [110, 737, 930, 1195], 'the same winners')
// Target is 30 ms; allow slack for a loaded machine.
assert.ok(perf.medianMs < 60, `median ${perf.medianMs} ms is far above the 30 ms target`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })

const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()
const baseline = git('log', '--all', '--format=%H', '--grep=^Fixture baseline$').split('\n').at(-1)
assert.equal(git('rev-parse', 'main'), baseline, 'main is untouched')
assert.ok(git('rev-list', `${baseline}..HEAD`, '--', '.'), 'the speed-up is committed')
assert.equal(git('status', '--porcelain', '--', 'src'), '', 'no uncommitted source changes')
