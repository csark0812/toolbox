import { readFileSync } from 'node:fs'
import { taskLines } from '../src/tasks.mjs'

const tasks = JSON.parse(readFileSync(new URL('../data/tasks.json', import.meta.url), 'utf8'))
for (const task of tasks) console.log(taskLines(task).join('\n'))
