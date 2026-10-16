// In-memory stand-in for the accounts database. Every call yields to the event loop, as the real
// driver does.
const tick = () => new Promise((resolve) => setImmediate(resolve))

const users = new Map()
const referrals = []

export async function createUser({ id, email, name }) {
  await tick()
  if (users.has(id)) throw new Error(`user ${id} exists`)
  users.set(id, { id, email, name })
  return users.get(id)
}

export async function getUser(id) {
  await tick()
  return users.get(id) ?? null
}

export async function recordReferral(referrerId, referredId) {
  await tick()
  referrals.push({ referrerId, referredId })
}

export async function countReferrals(referrerId) {
  await tick()
  return referrals.filter((referral) => referral.referrerId === referrerId).length
}

/** Test helper: forget everything. */
export function reset() {
  users.clear()
  referrals.length = 0
}
