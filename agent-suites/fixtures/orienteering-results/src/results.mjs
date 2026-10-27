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
export function results(courses, runners) {
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

/** "1:02:05" or "48:10" for a time in seconds. */
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = String(seconds % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}
