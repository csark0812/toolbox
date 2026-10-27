import { RENT, WATER } from './config.mjs'

/** The size name for a plot size: 1, 0.5 or 0.25. */
export function sizeName(size) {
  if (size >= 0.5) return 'full'
  if (size >= 0.25) return 'half'
  return 'quarter'
}

/** This year's bill for one plot. */
export function bill(plot) {
  const rent = RENT[sizeName(plot.size)]
  return { rent, water: WATER, total: rent + WATER }
}

/** The bill line printed for a plot. */
export function billLine(plot) {
  const { rent, water, total } = bill(plot)
  return `Plot ${String(plot.plot).padStart(2)}  ${plot.holder.padEnd(12)}rent £${rent}  water £${water}  total £${total}`
}
