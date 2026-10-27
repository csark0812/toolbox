import { readFileSync } from 'node:fs'
import { problemLine } from '../src/problems.mjs'

const problems = JSON.parse(readFileSync(new URL('../data/problems.json', import.meta.url), 'utf8'))
for (const problem of problems) console.log(problemLine(problem))
