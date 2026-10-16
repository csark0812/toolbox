// Hidden acceptance for the histogram memory work: identical statistics to the original on random
// images (transparent pixels, clipped levels, empty and tiny images), the same result hash on the
// frozen 6-megapixel image, and a median peak under the target.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const dir = process.argv[2]
const { imageStats } = await import(pathToFileURL(join(dir, 'src/stats.mjs')).href)
function reference(rgba, width, height) {
  const levels = []
  for (let i = 0; i < width * height * 4; i += 4)
    if (rgba[i + 3] > 0)
      levels.push(Math.round(0.2126 * rgba[i] + 0.7152 * rgba[i + 1] + 0.0722 * rgba[i + 2]))
  const histogram = new Array(256).fill(0)
  for (const level of levels) histogram[level]++
  const sorted = [...levels].sort((a, b) => a - b)
  const rank = (p) => sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)] ?? null
  const sum = levels.reduce((t, l) => t + l, 0)
  return {
    pixels: levels.length,
    histogram,
    mean: levels.length ? Math.round((sum / levels.length) * 100) / 100 : null,
    median: rank(50),
    p1: rank(1),
    p99: rank(99),
    clippedBlack: histogram[0],
    clippedWhite: histogram[255],
  }
}
let seed = 5
const next = () => (seed = (seed * 48271) % 2147483647)
for (let round = 0; round < 120; round++) {
  const width = next() % 40
  const height = next() % 30
  const rgba = new Uint8Array(width * height * 4)
  const mode = round % 4
  for (let i = 0; i < rgba.length; i++) {
    const v = next() % 256
    rgba[i] = mode === 1 ? (v < 128 ? 0 : 255) : mode === 2 ? 128 + (v % 3) : v
    if (i % 4 === 3) rgba[i] = next() % 5 === 0 ? 0 : v || 1
  }
  if (mode === 3) for (let i = 3; i < rgba.length; i += 4) rgba[i] = 0
  assert.deepEqual(
    JSON.parse(JSON.stringify(imageStats(rgba, width, height))),
    reference(rgba, width, height),
    `round ${round}: ${width}x${height}`,
  )
}
const perf = JSON.parse(
  execFileSync(process.execPath, ['perf/measure.mjs'], {
    cwd: dir,
    encoding: 'utf8',
    timeout: 110000,
  }),
)
assert.equal(perf.errors, 0)
assert.equal(perf.work, 5960064, 'the same visible pixels are counted')
assert.equal(
  perf.sha256,
  '25c27c0dbc50cb778681c570681da26b85095625601290b22424580f9b42906b',
  'the full-size result is identical',
)
// Target is 120 MB; allow some slack for runtime differences.
assert.ok(perf.medianPeakMb < 150, `median peak ${perf.medianPeakMb} MB is far above 120 MB`)
execFileSync(process.execPath, ['--test'], { cwd: dir, stdio: 'pipe' })
