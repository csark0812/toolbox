// The barn till: price pumpkins straight off the scale.
// npm run till -- <variety> <kg> [<variety> <kg> ...]
import { pathToFileURL } from 'node:url'
import { pounds } from '../src/money.mjs'

// Pence per kilo.
export const RATES = { carving: 120, giant: 85, munchkin: 240, crown: 180 }

export function tillPrice(kg, variety) {
  const rate = RATES[variety]
  if (rate === undefined) throw new Error(`Unknown variety: ${variety}`)
  return Math.round((kg * rate) / 10) * 10
}

function main(args) {
  if (args.length === 0 || args.length % 2 !== 0) {
    console.error('Usage: npm run till -- <variety> <kg> [<variety> <kg> ...]')
    return 2
  }
  let total = 0
  for (let i = 0; i < args.length; i += 2) {
    const variety = args[i]
    const kg = Number(args[i + 1])
    if (!Number.isFinite(kg) || kg <= 0) {
      console.error(`Bad weight for ${variety}: ${args[i + 1]}`)
      return 2
    }
    let pence
    try {
      pence = tillPrice(kg, variety)
    } catch (error) {
      console.error(error.message)
      return 1
    }
    total += pence
    console.log(
      `${variety.padEnd(9)} ${kg.toFixed(2).padStart(6)} kg  ${pounds(pence).padStart(7)}`,
    )
  }
  console.log(`${'TOTAL'.padEnd(19)}  ${pounds(total).padStart(7)}`)
  return 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  process.exitCode = main(process.argv.slice(2))
