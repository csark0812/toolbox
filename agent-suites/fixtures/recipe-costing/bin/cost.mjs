#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { argv, exit, stderr, stdout } from 'node:process'
import { lineCost, pounds, recipeCost } from '../src/costing.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
const prices = read('prices.json')
const recipe = read('recipes.json').find((r) => r.name === argv.slice(2).join(' '))
if (!recipe) {
  stderr.write('usage: cost <recipe name>\n')
  exit(2)
}
stdout.write(`${recipe.name} (serves ${recipe.serves})\n`)
for (const line of recipe.ingredients)
  stdout.write(
    `  ${line.item.padEnd(16)} ${String(line.amount).padStart(5)} ${prices[line.item].unit.padEnd(4)} ${pounds(Math.round(lineCost(line, prices))).padStart(6)}\n`,
  )
stdout.write(`  ${'Total'.padEnd(27)} ${pounds(recipeCost(recipe, prices)).padStart(6)}\n`)
