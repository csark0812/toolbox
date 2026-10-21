import {
  FLAG_PENCE,
  MILE_PENCE,
  NIGHT_FROM,
  NIGHT_RATE,
  NIGHT_TO,
  WAIT_PENCE_PER_MINUTE,
} from './config.mjs'

export const money = (pence) => `£${(pence / 100).toFixed(2)}`

/** Whether a pickup time (HH:MM, 24-hour clock) is on the night rate. */
export function isNight(time) {
  const hour = Number(time.slice(0, 2))
  return hour >= NIGHT_FROM && hour < NIGHT_TO
}

/** A job's fare in pence: the meter, at night rate if it applies, plus waiting time. */
export function fare(job) {
  const meter = FLAG_PENCE + Math.round(job.miles * MILE_PENCE)
  const rate = isNight(job.time) ? NIGHT_RATE : 1
  return Math.round(meter * rate) + job.waitMins * WAIT_PENCE_PER_MINUTE
}

/** Jobs in pickup order. */
export const inOrder = (jobs) =>
  [...jobs].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))

/** Each driver's takings, by driver name. */
export function byDriver(jobs) {
  const totals = new Map()
  for (const job of jobs) totals.set(job.driver, (totals.get(job.driver) ?? 0) + fare(job))
  return [...totals].sort(([a], [b]) => a.localeCompare(b))
}
