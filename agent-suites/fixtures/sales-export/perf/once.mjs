// One full-size export in this process. Prints { peakMb, rows, sha256 }.
import { createHash } from 'node:crypto'
import { resourceUsage, stdout } from 'node:process'
import { exportCsv } from '../src/export.mjs'
import { makeSales } from './data.mjs'
const hash = createHash('sha256')
const sink = { write: (text) => void hash.update(text) }
const { rows } = exportCsv(makeSales(400000), sink)
stdout.write(
  JSON.stringify({
    peakMb: Number((resourceUsage().maxRSS / 1024).toFixed(1)),
    rows,
    sha256: hash.digest('hex'),
  }) + '\n',
)
