import { parseArgs, today } from '../src/args.mjs'
import { batchLabel } from '../src/batches.mjs'
import { isReady, loadWheels } from '../src/wheels.mjs'

const opts = parseArgs(process.argv.slice(2))
const date = today(opts)
const ready = loadWheels(opts.file).filter((wheel) => isReady(wheel, date))

if (opts.json) {
  // The label printer reads this straight from stdout.
  const labels = ready.map((wheel) => ({ ...wheel, label: batchLabel(wheel.batchId) }))
  console.log(JSON.stringify(labels, null, 2))
} else if (ready.length === 0) {
  console.log(`Nothing ready on ${date}.`)
} else {
  for (const wheel of ready) {
    console.log(
      `${batchLabel(wheel.batchId)} · ${wheel.wheelId} · ${wheel.cheese} · ${wheel.weightKg} kg`,
    )
  }
}
