import * as format from './format.mjs'

// Template tokens and the formatter each one calls with (meters) or (seconds, meters).
const TOKENS = {
  distance_km: 'formatKm',
  distance_mi: 'formatMiles',
  pace_km: 'paceKm',
  pace_mi: 'paceMiles',
}

/** Fill `{name}`, `{runs}`, `{time}` and the unit tokens in a template. */
export function render(template, { name, runs }) {
  const meters = runs.reduce((sum, run) => sum + run.meters, 0)
  const seconds = runs.reduce((sum, run) => sum + run.seconds, 0)
  return template.replace(/\{(\w+)\}/g, (match, token) => {
    if (token === 'name') return name
    if (token === 'runs') return String(runs.length)
    if (token === 'time') return format.formatDuration(seconds)
    const fn = TOKENS[token]
    if (!fn) return match
    return token.startsWith('pace') ? format[fn](seconds, meters) : format[fn](meters)
  })
}
