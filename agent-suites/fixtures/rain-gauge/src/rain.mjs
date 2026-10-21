import { ukDay } from './ukdays.mjs'

export const MM_PER_TIP = 0.2
export const HEAVY_MM = 25

export function parseTips(text) {
  return text
    .trim()
    .split('\n')
    .slice(1)
    .map((row) => row.split(',')[0])
}

function daysOfMonth(month) {
  const [year, m] = month.split('-').map(Number)
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate()
  return Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`)
}

/** Rainfall on each UK day of a month, in millimetres. */
export function monthRain(stamps, month) {
  const tips = new Map(daysOfMonth(month).map((day) => [day, 0]))
  for (const stamp of stamps) {
    const day = ukDay(stamp)
    if (tips.has(day)) tips.set(day, tips.get(day) + 1)
  }
  return [...tips].map(([day, count]) => {
    const mm = Math.round(count * MM_PER_TIP * 10) / 10
    return { day, mm, heavy: mm >= HEAVY_MM }
  })
}
