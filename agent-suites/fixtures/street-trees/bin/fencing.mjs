import { readFileSync } from 'node:fs'
import { fencingList, parseSurveys, parseTrees } from '../src/trees.mjs'

const read = (name) => readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8')
const list = fencingList(parseTrees(read('trees.csv')), parseSurveys(read('surveys.csv')))

for (const { tree, species, street, latest, fence } of list) {
  const survey = latest
    ? `${latest.date.padEnd(10)}  ${latest.condition.padEnd(6)}`
    : 'never surveyed    '
  console.log(
    `${tree}  ${species.padEnd(14)}  ${street.padEnd(16)}  ${survey}${fence ? '  FENCE' : ''}`,
  )
}
console.log(`${list.filter((row) => row.fence).length} trees to keep fenced`)
