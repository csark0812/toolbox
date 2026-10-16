/** Bracket slot order for a power-of-two size, so seeds 1 and 2 are in opposite halves. */
export function seedOrder(size) {
  let order = [1]
  while (order.length < size) {
    const next = order.length * 2 + 1
    order = order.flatMap((seed) => [seed, next - seed])
  }
  return order
}

/** First-round matches as [home, away]; `null` marks a bye. */
export function firstRound(players) {
  if (players.length < 2) throw new RangeError('a bracket needs at least two players')
  let size = 1
  while (size < players.length) size *= 2
  const slots = [...players]
  while (slots.length < size) slots.unshift(null)
  const order = seedOrder(size)
  const matches = []
  for (let i = 0; i < size; i += 2) matches.push([slots[order[i] - 1], slots[order[i + 1] - 1]])
  return matches
}
