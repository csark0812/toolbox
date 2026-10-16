// Card payment holds (stand-in for the payment provider's API).
let next = 1
export const holds = new Map()

export async function holdPayment(userId, amountCents) {
  await new Promise((resolve) => setTimeout(resolve, 2))
  const hold = { id: `hold_${next++}`, userId, amountCents, status: 'held' }
  holds.set(hold.id, hold)
  return hold
}

export async function releaseHold(holdId) {
  await new Promise((resolve) => setTimeout(resolve, 2))
  const hold = holds.get(holdId)
  if (hold) hold.status = 'released'
}
