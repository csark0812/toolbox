import { fmtMinutes } from '../helpers.mjs'
import { steps } from '../program.mjs'

const clock = (minutes) =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

export default function plan(programs, [name, start = '18:00']) {
  const program = programs[name]
  if (!program) throw new Error(`no program called ${name}`)
  const match = /^(\d{2}):(\d{2})$/.exec(start)
  if (!match) throw new Error(`start time must be HH:MM, got ${start}`)
  let at = Number(match[1]) * 60 + Number(match[2])
  const lines = [`${name} from ${start}`]
  for (const step of steps(program)) {
    at += step.minutes
    const what = step.shape === 'ramp' ? `ramp to ${step.to}°C at ${step.rate}°C/h` : 'hold'
    lines.push(`  ${what.padEnd(26)}${fmtMinutes(step.minutes).padStart(8)}  until ${clock(at)}`)
  }
  return lines
}
