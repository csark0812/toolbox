const tick = () => new Promise((resolve) => setImmediate(resolve))
const balances = new Map()

/** Add `cents` of credit to an account. */
export async function addCredit(userId, cents) {
  if (!Number.isInteger(cents) || cents <= 0) throw new RangeError(`bad credit: ${cents}`)
  await tick()
  balances.set(userId, (balances.get(userId) ?? 0) + cents)
}

export const balance = (userId) => balances.get(userId) ?? 0

/** Test helper: forget every balance. */
export const resetCredits = () => balances.clear()
