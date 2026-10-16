import { formatTemp } from './units.mjs'

const DEFAULT_LIMITS = { temp_max: 22, temp_min: 16, days_max: 21 }
const LAGER_STYLES = ['lager', 'pilsner', 'bock']
const DAY_MS = 24 * 60 * 60 * 1000

/** A limit from the environment (`BREW_ALERT_<NAME>`), or its default. */
function limit(name) {
  const value = process.env[`BREW_ALERT_${name.toUpperCase()}`]
  return value === undefined || value === '' ? DEFAULT_LIMITS[name] : Number(value)
}

/** Problems with one batch at `now`. Lagers ferment cold, so they have no lower limit. */
export function batchAlerts(batch, now) {
  const alerts = []
  const latest = batch.readings.at(-1)
  if (latest && latest.tempC > limit('temp_max'))
    alerts.push(`too warm at ${formatTemp(latest.tempC)}`)
  if (latest && latest.tempC < limit('temp_min') && !LAGER_STYLES.includes(batch.style))
    alerts.push(`too cold at ${formatTemp(latest.tempC)}`)
  const days = Math.floor((now - new Date(`${batch.brewed}T00:00:00Z`)) / DAY_MS)
  if (days > limit('days_max')) alerts.push(`${days} days in the fermenter`)
  if (!latest) alerts.push('no readings yet')
  return alerts
}
