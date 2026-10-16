// One full-size analysis in this process. Prints { peakMb, pixels, sha256 }.
import { createHash } from 'node:crypto'
import { resourceUsage, stdout } from 'node:process'
import { imageStats } from '../src/stats.mjs'
import { makeImage } from './data.mjs'
const width = 3000
const height = 2000
const stats = imageStats(makeImage(width, height), width, height)
stdout.write(
  JSON.stringify({
    peakMb: Number((resourceUsage().maxRSS / 1024).toFixed(1)),
    pixels: stats.pixels,
    sha256: createHash('sha256').update(JSON.stringify(stats)).digest('hex'),
  }) + '\n',
)
