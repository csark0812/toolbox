/** A copy of `recipe` with every ingredient amount scaled to `servings`. */
export function scale(recipe, servings) {
  const factor = servings / recipe.servings
  return {
    ...recipe,
    servings,
    ingredients: recipe.ingredients.map((item) => ({
      ...item,
      qty: Math.round(item.qty * factor),
    })),
  }
}
