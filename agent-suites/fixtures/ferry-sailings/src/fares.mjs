// Car fares need a look-up in the vehicle registry, which is slower than a foot fare.
const lookup = (trips) =>
  trips > 0 ? new Promise((resolve) => setImmediate(() => resolve(lookup(trips - 1)))) : null

/** The fare in pence for a booking request. */
export async function quoteFare(request) {
  if (request.vehicle === 'car') {
    await lookup(3)
    return 3800 + 600 * Math.max(0, request.passengers - 1)
  }
  await lookup(1)
  return 950 * request.passengers
}
