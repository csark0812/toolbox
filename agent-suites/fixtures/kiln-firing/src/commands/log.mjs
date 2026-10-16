import { fmtMinutes } from '#time'

export default function log(programs, args, firings) {
  return firings.map(
    (firing) =>
      `${firing.date}  ${firing.program.padEnd(7)} ${fmtMinutes(firing.minutes).padStart(8)}  ${firing.by}`,
  )
}
