import { minutesToClock } from '../library.mjs'

export function render(rows) {
  const lines = ['stop,village,name,arrive,leave,drive,holds']
  for (const row of rows)
    lines.push(
      [
        row.stop.id,
        row.stop.village,
        row.stop.name,
        minutesToClock(row.arrive),
        minutesToClock(row.leave),
        row.drive ?? '',
        row.holds,
      ].join(','),
    )
  return lines.join('\n')
}
