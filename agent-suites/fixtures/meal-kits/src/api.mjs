import { isoDay, weeksAfter } from './store.mjs'

/** GET /subscription: the signed-in customer's subscription. */
export function handleGetSubscription(store, request, session) {
  const sub = store.get(session.customerId)
  if (!sub) return { status: 404, body: { error: 'no subscription' } }
  return { status: 200, body: { ...sub, nextDelivery: isoDay(sub.nextDelivery) } }
}

/** POST /skip: skip the next delivery. */
export function handleSkipWeek(store, request, session) {
  const sub = store.get(session.customerId)
  if (!sub) return { status: 404, body: { error: 'no subscription' } }
  const skipped = sub.nextDelivery
  store.set(sub.customerId, { ...sub, nextDelivery: weeksAfter(skipped, 1) })
  return { status: 200, body: { skipped: isoDay(skipped) } }
}
