const OVERHANG = 4
const BACKING_USABLE = 40
const BATTING_WIDTH = 90
const quarterYards = (inches) => Math.ceil((inches / 36) * 4) / 4

/** Yards of 42-inch backing fabric, seamed from 40-inch usable widths. */
export function calc_backing(quilt) {
  const widths = Math.ceil((quilt.width + 2 * OVERHANG) / BACKING_USABLE)
  return quarterYards(widths * (quilt.length + 2 * OVERHANG))
}

/** Yards of 90-inch batting; two lengths for anything wider than the roll. */
export function calc_batting(quilt) {
  const lengths = Math.ceil((quilt.width + 2 * OVERHANG) / BATTING_WIDTH)
  return lengths * quarterYards(quilt.length + 2 * OVERHANG)
}

/** Inches of binding: the perimeter plus 10 inches for joins and corners. */
export function calc_binding(quilt) {
  return 2 * (quilt.width + quilt.length) + 10
}
