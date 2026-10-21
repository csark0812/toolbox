import { readFileSync } from 'node:fs'
import { argv } from 'node:process'
import { nextHighWaters } from '../src/tides.mjs'

const tides = JSON.parse(readFileSync(new URL('../data/tides.json', import.meta.url), 'utf8'))
const [port, at] = argv.slice(2)
const [answer] = nextHighWaters(tides, [{ id: 'q', port, at }])
if (!answer.tide) console.log(`No high water predicted at ${port} after ${at}.`)
else {
  const tide = tides.find((entry) => entry.id === answer.tide)
  const hours = Math.floor(answer.minutes / 60)
  console.log(
    `Next high water at ${tide.port.trim()}: ${tide.time.replace('T', ' ')} (${tide.height} m), in ${hours} h ${answer.minutes % 60} min`,
  )
}
