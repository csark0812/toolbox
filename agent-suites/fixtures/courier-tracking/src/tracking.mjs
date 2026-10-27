import { parcels } from './store.mjs'

/** The public tracking page: status, destination town and scan history, nothing personal. */
export function trackParcel(request) {
  const parcel = parcels().find((entry) => entry.number === request.params.number)
  if (!parcel) return { status: 404, body: { error: 'no parcel with that number' } }
  const { number, status, town, events } = parcel
  return { status: 200, body: { number, status, town, events } }
}
