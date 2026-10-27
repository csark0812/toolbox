import { daysToGo, show } from '../src/show.mjs'

const today = process.argv[2] ?? new Date().toISOString().slice(0, 10)
const days = daysToGo(today)
console.log(days > 0 ? `${days} days to go until the ${show.name}` : `The ${show.name} is here!`)
