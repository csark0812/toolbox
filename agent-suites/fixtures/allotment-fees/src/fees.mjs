import { tariffFor } from './tariff.mjs'

/** A plot's annual fee in pence. */
export function annualFee(plot) {
  const tariff = tariffFor(plot)
  const rent = plot.area * tariff.ratePence * (1 - tariff.discount)
  return Math.round(rent) + tariff.waterPence
}

/** Pence as pounds, `£12.34`. */
export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`

/** One invoice line per plot and the season total, in pence. */
export function invoiceRun(plots) {
  const lines = plots.map((plot) => ({ ...plot, fee: annualFee(plot) }))
  let total = 0
  for (const line of lines) total += line.fee / 100
  return { lines, total: Math.round(total * 100) }
}

export const formatLine = (line) =>
  `Plot ${String(line.plot).padStart(2)}  ${line.holder.padEnd(12)}  ${String(line.area).padStart(3)} m²  ${pounds(line.fee).padStart(7)}`
