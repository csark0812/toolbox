/** Seconds since midnight for a clock time written `HH:MM:SS`. */
export function seconds(clock) {
  const [h, m, s] = clock.split(':').map(Number)
  return h * 3600 + m * 60 + s
}

/** Time, penalty, age allowance and adjusted time for one runner, all in seconds. */
export function score(start, runner) {
  const time = seconds(runner.finish) - seconds(start)
  const penalty = runner.missed.length * 10 * 60
  const allowance = runner.age >= 60 ? 6 * 60 : runner.age > 50 ? 3 * 60 : 0
  return { name: runner.name, time, penalty, allowance, adjusted: time + penalty - allowance }
}

/** Every runner scored and placed, fastest first. */
export function results(race) {
  return race.runners
    .map((runner) => score(race.start, runner))
    .sort((a, b) => a.time - b.time)
    .map((row, i) => ({ place: i + 1, ...row }))
}

/** `M:SS` for a number of seconds. */
export function mmss(total) {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}
