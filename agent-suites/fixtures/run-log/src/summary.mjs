import { formatDuration, formatKm, formatMiles, paceKm, paceMiles } from './format.mjs'

/** Totals and the longest run, in the chosen units. */
export function summary(runs, units) {
  const meters = runs.reduce((sum, run) => sum + run.meters, 0)
  const seconds = runs.reduce((sum, run) => sum + run.seconds, 0)
  const longest = runs.reduce((best, run) => (run.meters > best.meters ? run : best), runs[0])
  const distance = units === 'mi' ? formatMiles : formatKm
  const pace = units === 'mi' ? paceMiles : paceKm
  return [
    `${runs.length} runs, ${distance(meters)} in ${formatDuration(seconds)}`,
    `average pace ${pace(seconds, meters)}`,
    `longest: ${longest.date}, ${distance(longest.meters)}`,
  ]
}
