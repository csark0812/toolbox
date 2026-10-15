import { readFileSync } from 'node:fs'

export function loadRecipes() {
  return JSON.parse(readFileSync(new URL('../data/recipes.json', import.meta.url), 'utf8'))
}

export function byCategory(recipes, category) {
  return recipes.filter((recipe) => recipe.category === category)
}
