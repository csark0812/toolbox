/** Rec. 709 luminance of one pixel, rounded to a whole level. */
export function luminance(r, g, b) {
  return Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
}

function toPixels(rgba, width, height) {
  const pixels = []
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      pixels.push({ x, y, r: rgba[i], g: rgba[i + 1], b: rgba[i + 2], a: rgba[i + 3] })
    }
  return pixels
}

/** Exposure statistics for an RGBA image. */
export function imageStats(rgba, width, height) {
  const visible = toPixels(rgba, width, height).filter((pixel) => pixel.a > 0)
  const levels = visible.map((pixel) => luminance(pixel.r, pixel.g, pixel.b))
  const histogram = new Array(256).fill(0)
  for (const level of levels) histogram[level]++
  const sorted = [...levels].sort((a, b) => a - b)
  const rank = (p) => sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)] ?? null
  const sum = levels.reduce((total, level) => total + level, 0)
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
