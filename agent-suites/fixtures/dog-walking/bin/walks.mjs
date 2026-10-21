import { readFileSync } from 'node:fs'

const walks = JSON.parse(readFileSync(new URL('../data/walks.json', import.meta.url), 'utf8'))
for (const walk of walks)
  console.log(
    `${walk.date}  ${walk.dog.padEnd(8)}${String(walk.minutes).padStart(3)} min  ${walk.walker}`,
  )
