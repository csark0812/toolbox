import { instruments, rentals, saveRental } from './store.mjs'

const DAY = 24 * 60 * 60 * 1000
const addDays = (date, days) => new Date(Date.parse(date) + days * DAY).toISOString().slice(0, 10)
const isOut = (instrumentId) =>
  rentals().some((entry) => entry.instrumentId === instrumentId && entry.status !== 'returned')

/** Lists every instrument and whether it can be rented now. */
export function listInstruments(request, session) {
  if (!session) return { status: 401, body: { error: 'sign in' } }
  return {
    status: 200,
    body: instruments().map((instrument) => ({ ...instrument, available: !isOut(instrument.id) })),
  }
}

/** Lists the signed-in customer's rentals. */
export function myRentals(request, session) {
  if (!session?.customerId) return { status: 401, body: { error: 'sign in' } }
  return {
    status: 200,
    body: rentals().filter((entry) => entry.customerId === session.customerId),
  }
}

/** Starts a rental for the signed-in customer; the first month is paid at the counter. */
export function startRental(request, session) {
  if (!session?.customerId) return { status: 401, body: { error: 'sign in' } }
  const instrument = instruments().find((entry) => entry.id === request.params.id)
  if (!instrument) return { status: 404, body: { error: 'not found' } }
  if (isOut(instrument.id)) return { status: 409, body: { error: 'instrument is out' } }
  const rental = {
    id: `r-${rentals().length + 1}`,
    customerId: session.customerId,
    instrumentId: instrument.id,
    startedOn: request.today,
    monthsPaid: 1,
    paidUntil: addDays(request.today, 30),
    status: 'active',
  }
  saveRental(rental)
  return { status: 201, body: rental }
}

/** Records a month's rent taken at the counter. */
export function recordPayment(request, session) {
  if (!session?.staffId) return { status: 401, body: { error: 'staff only' } }
  const rental = rentals().find((entry) => entry.id === request.params.id)
  if (!rental || rental.status === 'returned') return { status: 404, body: { error: 'not found' } }
  const updated = {
    ...rental,
    monthsPaid: rental.monthsPaid + 1,
    paidUntil: addDays(rental.paidUntil, 30),
    status: 'active',
  }
  saveRental(updated)
  return { status: 200, body: updated }
}
