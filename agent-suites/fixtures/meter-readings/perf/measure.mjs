// Summarises a synthetic quarter in fresh processes and reports the median peak memory.
// Prints one JSON line.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, renameSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execPath, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
import { DAYS, METERS, writeQuarter } from './data.mjs'
const folder = join(tmpdir(), 'meter-readings-perf')
const file = join(folder, `quarter-${METERS}x${DAYS}.csv`)
if (!existsSync(file)) {
  mkdirSync(folder, { recursive: true })
  await writeQuarter(`${file}.partial`)
  renameSync(`${file}.partial`, file)
}
const once = fileURLToPath(new URL('./once.mjs', import.meta.url))
const RUNS = 5
const results = []
for (let run = 0; run < RUNS; run++)
  results.push(JSON.parse(execFileSync(execPath, [once, file], { encoding: 'utf8' })))
const peaks = results.map((result) => result.peakMb).sort((a, b) => a - b)
stdout.write(
  JSON.stringify({
    medianPeakMb: peaks[2],
    range: [peaks[0], peaks[RUNS - 1]],
    runs: RUNS,
    errors: results.filter((result) => result.sha256 !== results[0].sha256).length,
    work: results[0].readings,
    sha256: results[0].sha256,
  }) + '\n',
)
