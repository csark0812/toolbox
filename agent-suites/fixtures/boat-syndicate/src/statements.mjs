/** Hours are logged to the nearest six minutes, so work in whole tenths of an hour and keep the sums exact. */
const tenths = (hours) => Math.round(Number(hours) * 10)

const within = (date, from, to) => {
  const day = Date.parse(date)
  return day >= Date.parse(from) && day <= Date.parse(to)
}

/** Whether the member was in the syndicate for any part of the cost's period. */
const onBoard = (member, cost) =>
  Date.parse(member.joined ?? '1970-01-01') <= Date.parse(cost.to) &&
  Date.parse(member.left ?? '9999-12-31') >= Date.parse(cost.from)

/** Tenths of an hour the member spent out on the boat during the cost's period. */
function usage(member, trips, cost) {
  return trips
    .filter((trip) => trip.member === member.id && within(trip.date, cost.from, cost.to))
    .reduce((sum, trip) => sum + tenths(trip.hours), 0)
}

/**
 * Splits `pence` in proportion to `weights` in whole pence: everyone gets the floor of their exact
 * share, and the pennies left over go one each to the largest remainders, earlier members first on a tie.
 */
export function apportion(pence, weights) {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  const shares = weights.map((weight) => Math.floor((pence * weight) / total))
  const order = weights
    .map((weight, i) => ({ i, rest: pence * weight - shares[i] * total }))
    .sort((a, b) => b.rest - a.rest || a.i - b.i)
  let left = pence - shares.reduce((sum, share) => sum + share, 0)
  for (const { i } of order) {
    if (left <= 0) break
    shares[i]++
    left--
  }
  return shares
}

/** Each member's weight for one cost. */
function weights(members, trips, cost) {
  const aboard = members.filter((member) => onBoard(member, cost))
  const pool = aboard.length ? aboard : members
  const byShares = members.map((member) => (pool.includes(member) ? (member.share ?? 1) : 0))
  if (cost.basis === 'shares') return byShares
  if (cost.basis === 'equal') return members.map((member) => (pool.includes(member) ? 1 : 0))
  const hours = members.map((member) => usage(member, trips, cost))
  return hours.some((h) => h > 0) ? hours : byShares
}

/** Every member's statement: their share of each cost, in pence, and their total. */
export function statements(members, trips, costs) {
  const lines = members.map(() => [])
  for (const cost of costs) {
    const shares = apportion(cost.pence, weights(members, trips, cost))
    shares.forEach((pence, i) => lines[i].push({ cost: cost.id, pence }))
  }
  return members.map((member, i) => ({
    id: member.id,
    name: member.name,
    lines: lines[i],
    total: lines[i].reduce((sum, line) => sum + line.pence, 0),
  }))
}
