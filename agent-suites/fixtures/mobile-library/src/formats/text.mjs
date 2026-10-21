import { minutesToClock, padStop } from '../library.mjs'

export function render(rows, { day, week }) {
  const lines = [`${day} run, week ${week}`]
  for (const row of rows) {
    const drive = row.drive === null ? '' : `  (${row.drive} min drive)`
    const holds = row.holds ? `  ${row.holds} hold${row.holds === 1 ? '' : 's'}` : ''
    lines.push(
      `${minutesToClock(row.arrive)}-${minutesToClock(row.leave)}  ${padStop(row.stop)}${holds}${drive}`.trimEnd(),
    )
  }
  if (rows.length === 0) lines.push('No stops')
  return lines.join('\n')
}
