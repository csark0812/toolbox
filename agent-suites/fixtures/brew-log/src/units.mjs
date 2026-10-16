const UNITS = process.env.BREW_UNITS ?? 'metric'
if (!['metric', 'imperial'].includes(UNITS))
  throw new RangeError(`BREW_UNITS must be metric or imperial, not ${UNITS}`)

/** A temperature in the configured units, from Celsius. */
export function formatTemp(celsius) {
  return UNITS === 'imperial'
    ? `${((celsius * 9) / 5 + 32).toFixed(1)} °F`
    : `${celsius.toFixed(1)} °C`
}

export const formatGravity = (gravity) => gravity.toFixed(3)

/** Estimated alcohol by volume from original and current gravity. */
export const abv = (original, current) => ((original - current) * 131.25).toFixed(1)
