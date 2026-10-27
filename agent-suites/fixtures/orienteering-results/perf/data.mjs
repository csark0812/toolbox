// The regional championship download: four courses and every runner's punches, generated the same way every time.
export function makeEvent() {
  let seed = 20261018
  const next = () => (seed = (seed * 48271) % 2147483647)
  const code = () => 31 + (next() % 70)
  const courses = [
    { id: 'Brown', legs: 22 },
    { id: 'Blue', legs: 18 },
    { id: 'Green', legs: 14 },
    { id: 'Orange', legs: 10 },
  ].map(({ id, legs }) => ({ id, controls: Array.from({ length: legs }, code) }))
  const clockAt = (seconds) => {
    const t = seconds % 86400
    return [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60]
      .map((part) => String(part).padStart(2, '0'))
      .join(':')
  }
  const CLUBS = ['SROC', 'HAVOC', 'WAOC', 'DEE', 'BOK', 'MAROC']
  const FIRST = ['Alex', 'Bea', 'Cal', 'Dana', 'Eli', 'Fen', 'Gwen', 'Huw']
  const LAST = ['Rowe', 'Ince', 'Pyle', 'Moor', 'Fell', 'Tarn']
  const runners = []
  let bib = 100
  for (const [c, course] of courses.entries()) {
    for (let i = 0; i < 380 - c * 40; i++) {
      // Starts every minute from 22:30 for the night event, so plenty of runs cross midnight.
      let t = 22 * 3600 + 30 * 60 + (next() % 150) * 60
      const start = clockAt(t)
      const punches = []
      let skip = next() % 30 === 0 ? next() % course.controls.length : -1
      for (const [k, control] of course.controls.entries()) {
        t += 60 + (next() % 240)
        if (next() % 12 === 0) punches.push({ code: code(), time: clockAt(t - 20) })
        if (k !== skip) punches.push({ code: control, time: clockAt(t) })
      }
      t += 20 + (next() % 40)
      runners.push({
        bib: bib++,
        name: `${FIRST[next() % FIRST.length]} ${LAST[next() % LAST.length]}`,
        club: CLUBS[next() % CLUBS.length],
        course: course.id,
        start,
        finish: next() % 40 === 0 ? null : clockAt(t),
        punches,
      })
    }
  }
  return { courses, runners }
}
