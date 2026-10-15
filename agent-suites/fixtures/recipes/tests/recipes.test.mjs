import assert from 'node:assert/strict'
import { test } from 'node:test'
import { table } from '../src/format.mjs'
import { byCategory, loadRecipes } from '../src/recipes.mjs'
import { scale } from '../src/scale.mjs'

test('scales up', () => {
  const pancakes = loadRecipes().find((r) => r.id === 'pancakes')
  const doubled = scale(pancakes, 8)
  assert.equal(doubled.servings, 8)
  assert.equal(doubled.ingredients[0].qty, 500)
})

test('table lists every recipe', () => {
  assert.equal(table(loadRecipes()).split('\n').length, 3)
})

test('desserts', () => {
  assert.ok(byCategory(loadRecipes(), 'dessert').some((r) => r.id === 'panna-cotta'))
})
