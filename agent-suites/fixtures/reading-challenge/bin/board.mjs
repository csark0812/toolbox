import { readFileSync } from 'node:fs'
import { leaderboard } from '../src/board.mjs'

const read = (name) => JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), 'utf8'))
leaderboard(read('logs.json'), read('books.json')).forEach((row, index) => {
  console.log(
    `${String(index + 1).padStart(3)}  ${row.child.padEnd(14)} ${String(row.books).padStart(2)} books  ${String(row.pages).padStart(5)} pages  ${row.medal ?? ''}`.trimEnd(),
  )
})
