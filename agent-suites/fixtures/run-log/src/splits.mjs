import * as format from './format.mjs'

/** One line per lap: distance, and pace assuming an even effort. */
export function splits(run, units) {
  const secondsPerMeter = run.seconds / run.meters
  return run.laps.map((lap, i) => {
    const distance = units === 'mi' ? format.formatMiles(lap) : format.formatKm(lap)
    const pace =
      units === 'mi'
        ? format.paceMiles(lap * secondsPerMeter, lap)
        : format.paceKm(lap * secondsPerMeter, lap)
    return `lap ${i + 1}: ${distance} at ${pace}`
  })
}
