// Starts the CLI in fresh processes with a typical lookup and reports the median wall time.
// Prints one JSON line.
import { spawnSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { execPath, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
const cli = fileURLToPath(new URL('../bin/atlas.mjs', import.meta.url))
const args = [cli, 'capital', 'Peru', 'Japan', 'Kenya', 'Norway', 'Chile']
const expected = 'Peru: Lima\nJapan: Tokyo\nKenya: Nairobi\nNorway: Oslo\nChile: Santiago\n'
const RUNS = 11
const timings = []
let errors = 0
let work = 0
for (let run = 0; run < RUNS; run++) {
  const start = performance.now()
  const result = spawnSync(execPath, args, { encoding: 'utf8' })
  timings.push(performance.now() - start)
  if (result.status !== 0 || result.stdout !== expected) errors++
  if (run === 0) work = result.stdout.split('\n').filter(Boolean).length
}
timings.sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianMs: Number(timings[5].toFixed(1)),
    range: [Number(timings[0].toFixed(1)), Number(timings[RUNS - 1].toFixed(1))],
    runs: RUNS,
    errors,
    work,
  }) + '\n',
)
