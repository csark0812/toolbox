import { parseArgs, today } from '../src/args.mjs'
import { batchSummary, findBatch } from '../src/batches.mjs'
import { daysInCave, isReady, loadWheels } from '../src/wheels.mjs'

const opts = parseArgs(process.argv.slice(2))
const date = today(opts)
const wheels = loadWheels(opts.file)

if (opts.batch) {
  const members = findBatch(wheels, opts.batch)
  if (members.length === 0) {
    console.error(`No wheels in batch ${opts.batch}`)
    process.exit(1)
  }
  for (const wheel of members) {
    const state = isReady(wheel, date) ? 'ready' : 'ageing'
    console.log(
      `${wheel.wheelId}  ${wheel.cheese.padEnd(8)} made ${wheel.made}  ${String(daysInCave(wheel, date)).padStart(3)} days  ${state}`,
    )
  }
} else {
  for (const row of batchSummary(wheels, date)) {
    console.log(
      `${row.batchId}  ${row.cheese.padEnd(8)} ${String(row.wheels).padStart(2)} wheels  ${row.ready} ready`,
    )
  }
}
