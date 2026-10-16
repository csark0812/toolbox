// Runs perf/once.mjs in fresh processes and reports the median peak memory. Prints one JSON line.
import { execFileSync } from 'node:child_process'
import { execPath, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
const once = fileURLToPath(new URL('./once.mjs', import.meta.url))
const RUNS = 5
const results = []
for (let run = 0; run < RUNS; run++)
  results.push(JSON.parse(execFileSync(execPath, [once], { encoding: 'utf8' })))
const peaks = results.map((r) => r.peakMb).sort((a, b) => a - b)
const errors = results.filter((r) => r.sha256 !== results[0].sha256).length
stdout.write(
  JSON.stringify({
    medianPeakMb: peaks[2],
    range: [peaks[0], peaks[RUNS - 1]],
    runs: RUNS,
    errors,
    work: results[0].rows,
    sha256: results[0].sha256,
  }) + '\n',
)
