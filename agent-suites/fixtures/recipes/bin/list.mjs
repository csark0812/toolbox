import { table } from '../src/format.mjs'
import { loadRecipes } from '../src/recipes.mjs'

console.log(table(loadRecipes()))
