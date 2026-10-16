import { quoteFare } from './fares.mjs'

/** What a request takes from its sailing. */
function needs(request) {
  if (!['car', 'foot'].includes(request.vehicle))
    throw new RangeError(`unknown vehicle "${request.vehicle}"`)
  if (!Number.isInteger(request.passengers) || request.passengers < 1)
    throw new RangeError(`bad passenger count ${request.passengers}`)
  return { cars: request.vehicle === 'car' ? 1 : 0, passengers: request.passengers }
}

/** Books a request on its sailing if it fits: `{ ref, ok, fare? , reason? }`. */
export async function book(store, request) {
  const need = needs(request)
  const sailing = await store.get(request.sailing)
  if (!sailing) throw new RangeError(`unknown sailing "${request.sailing}"`)
  const fare = await quoteFare(request)
  if (sailing.cars + need.cars > sailing.carSpaces)
    return { ref: request.ref, ok: false, reason: 'car deck full' }
  if (sailing.passengers + need.passengers > sailing.seats)
    return { ref: request.ref, ok: false, reason: 'no seats' }
  await store.set(sailing.id, {
    ...sailing,
    cars: sailing.cars + need.cars,
    passengers: sailing.passengers + need.passengers,
  })
  return { ref: request.ref, ok: true, fare }
}
