import { localTime } from './clock.mjs'

const toMinutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3))

/**
 * The block in force at `date`: the last block of today's schedule that has started, or, before
 * today's first block, the last block of the day before.
 */
export function activeBlock(schedule, date) {
  const { weekday, minutes } = localTime(date, schedule.timeZone)
  const today = schedule.days[weekday]
  const started = today.blocks.filter(([start]) => toMinutes(start) <= minutes)
  if (started.length) {
    const [start, target] = started.at(-1)
    return { day: today.day, start, target }
  }
  const yesterday = schedule.days[(weekday + 6) % 7]
  const [start, target] = yesterday.blocks.at(-1)
  return { day: yesterday.day, start, target }
}
