const DAY = 24 * 60 * 60 * 1000

export const HOLD_DAYS = 28

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export const daysSince = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY)

/** Whether the item is still on the shelf: day 1 is the day it was found. */
export const isHeld = (item, today) => daysSince(item.foundOn, today) < HOLD_DAYS
