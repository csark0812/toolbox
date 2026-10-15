// Counts API units per account against a daily allowance. Days are UTC calendar days.
const DAY_MS = 86_400_000

export function createMeter({ dailyLimit }) {
  const usage = new Map()
  const dayOf = (nowMs) => Math.round(nowMs / DAY_MS)

  return {
    /** Record `units` for `account` at `nowMs`; true while the account is within its allowance. */
    record(account, units, nowMs) {
      const day = dayOf(nowMs)
      const entry = usage.get(account)
      if (!entry || entry.day !== day) usage.set(account, { day, used: units })
      else entry.used += units
      return usage.get(account).used <= dailyLimit
    },
  }
}
