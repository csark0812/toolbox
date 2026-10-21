import { SHOW } from '../src/config.mjs'
import { points, read } from '../src/data.mjs'
import { PLACES, placings } from '../src/show.mjs'

const exhibitors = read('exhibitors.json')
console.log(SHOW)
for (const result of placings(read('classes.json'), read('entries.json'), points())) {
  console.log(`Class ${result.class}  ${result.title} (${result.section})`)
  result.placed.forEach((entry, place) => {
    const who = exhibitors.find((exhibitor) => exhibitor.id === entry.exhibitor)
    console.log(
      `  ${PLACES[place]}  ${entry.entry}  ${who.name.padEnd(13)}${who.village.padEnd(10)}${entry.points} points`,
    )
  })
}
