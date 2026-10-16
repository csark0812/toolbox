// One summary of the quarter in this process. Prints { peakMb, readings, sha256 }.
import { createHash } from 'node:crypto'
import { argv, resourceUsage, stdout } from 'node:process'
import { monthlySummary } from '../src/summary.mjs'
const rows = await monthlySummary(argv[2])
stdout.write(
  JSON.stringify({
    peakMb: Number((resourceUsage().maxRSS / 1024).toFixed(1)),
    readings: rows.reduce((sum, row) => sum + row.readings, 0),
    sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex'),
  }) + '\n',
)
