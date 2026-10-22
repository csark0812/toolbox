// The weekly hay order for the merchant. Run from this folder: npm start [-- weeks [horses.json]]
import { dailyHay } from '../../src/feeds.mjs'
import { loadHorses, yard } from '../../src/horses.mjs'

const weeks = Number(process.argv[2] ?? 1)
const horses = loadHorses(process.argv[3]).filter((horse) => horse.livery !== 'diy')
const kg = horses.reduce((sum, horse) => sum + dailyHay(horse) * 7 * weeks, 0)
console.log(`Hay for ${weeks} week(s): ${kg}kg for ${horses.length} horses`)
console.log(`Order ${Math.ceil(kg / yard.baleKg)} bales of ${yard.baleKg}kg`)
