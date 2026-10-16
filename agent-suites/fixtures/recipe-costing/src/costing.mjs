/** Cost in pence of one ingredient line. */
export function lineCost(line, prices) {
  const price = prices[line.item]
  if (!price) throw new RangeError(`no price for "${line.item}"`)
  return line.amount * price.pence
}

/** A recipe's total cost in pence, rounded to the nearest penny. */
export function recipeCost(recipe, prices) {
  return Math.round(recipe.ingredients.reduce((sum, line) => sum + lineCost(line, prices), 0))
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
