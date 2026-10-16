import { fmtMinutes } from '../helpers.mjs'
import { totalMinutes } from '../program.mjs'

export default function total(programs, [name]) {
  const program = programs[name]
  if (!program) throw new Error(`no program called ${name}`)
  return [`${name}: ${fmtMinutes(totalMinutes(program))}`]
}
