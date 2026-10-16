/** A reading's value in Celsius. */
export function celsius(reading) {
  if (reading.unit === 'C') return reading.value
  if (reading.unit === 'F') return Math.round((((reading.value - 32) * 5) / 9) * 10) / 10
  throw new RangeError(`unknown unit "${reading.unit}"`)
}
