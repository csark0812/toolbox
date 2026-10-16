/**
 * Splits `totalCents` into whole-cent shares proportional to `weights`.
 * Leftover cents go to the largest fractional parts, earliest index first on a tie.
 */
export function allocate(totalCents, weights) {
  if (!Number.isInteger(totalCents) || totalCents < 0)
    throw new RangeError('total must be a whole number of cents')
  const sum = weights.reduce((a, b) => a + b, 0)
  if (!(sum > 0)) throw new RangeError('weights must add up to more than zero')
  const exact = weights.map((weight) => (totalCents * weight) / sum)
  const shares = exact.map((amount) => Math.round(amount))
  const leftover = totalCents - shares.reduce((a, b) => a + b, 0)
  const order = exact
    .map((amount, index) => ({ index, fraction: amount - Math.floor(amount) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  for (let k = 0; k < leftover; k++) shares[order[k].index]++
  return shares
}
