import { parseArgs, today } from '../src/args.mjs'
import { daysInCave, isReady, loadWheels } from '../src/wheels.mjs'

const FIELD_LABELS = {
  wheelId: 'Wheel',
  batchId: 'Batch',
  cheese: 'Cheese',
  made: 'Made',
  turns: 'Turns',
  weightKg: 'Weight (kg)',
  note: 'Note',
  washed: 'Washed rind',
}

const opts = parseArgs(process.argv.slice(2))
const date = today(opts)
const [id] = opts._
const wheel = loadWheels(opts.file).find((each) => each.wheelId === id)
if (!wheel) {
  console.error(`No wheel ${id}`)
  process.exit(1)
}
for (const [field, value] of Object.entries(wheel)) {
  console.log(`${(FIELD_LABELS[field] ?? field).padEnd(12)}${value}`)
}
console.log(
  `${'In cave'.padEnd(12)}${daysInCave(wheel, date)} days (${isReady(wheel, date) ? 'ready' : 'ageing'})`,
)
