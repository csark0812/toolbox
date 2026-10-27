import { isHeld } from './dates.mjs'
import { claims, items, saveClaim, saveItem } from './store.mjs'

/** Records a passenger's claim for staff to check against the hidden marks. */
export function makeClaim(request, session) {
  if (!session?.passengerId) return { status: 401, body: { error: 'sign in' } }
  const item = items().find(
    (entry) =>
      entry.id === request.params.id && entry.status === 'open' && isHeld(entry, request.today),
  )
  if (!item) return { status: 404, body: { error: 'not found' } }
  const description = String(request.body.description ?? '').trim()
  if (!description) return { status: 400, body: { error: 'describe the item' } }
  const claim = {
    id: `cl-${claims().length + 1}`,
    itemId: item.id,
    passengerId: session.passengerId,
    description,
    status: 'pending',
  }
  saveClaim(claim)
  return { status: 201, body: claim }
}

/** Staff release an item to the passenger whose claim they have checked. */
export function releaseClaim(request, session) {
  if (!session?.staffId) return { status: 401, body: { error: 'staff only' } }
  const claim = claims().find((entry) => entry.id === request.params.id)
  if (!claim || claim.status !== 'pending') return { status: 404, body: { error: 'not found' } }
  const item = items().find((entry) => entry.id === claim.itemId)
  if (item.status !== 'open') return { status: 409, body: { error: 'already released' } }
  saveItem({ ...item, status: 'released', releasedTo: claim.passengerId })
  saveClaim({ ...claim, status: 'released' })
  return { status: 200, body: { released: item.id, to: claim.passengerId } }
}
