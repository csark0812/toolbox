/** A reading in °C, whatever unit the sensor reports. */
export function toCelsius(value, unit) {
  if (unit === 'C') return value
  if (unit === 'F') return value - (32 * 5) / 9
  throw new RangeError(`Unknown unit ${unit}`)
}
