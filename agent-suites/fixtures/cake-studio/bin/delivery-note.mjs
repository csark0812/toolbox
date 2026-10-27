import { config, findOrder } from '../src/orders.mjs'

const PI = 3.14

function servings(order) {
  const perPortion = config.portionSqIn[order.style] ?? 1
  let total = 0
  for (const tier of order.tiers) {
    const area =
      tier.shape === 'round' ? PI * (tier.size / 2) * (tier.size / 2) : tier.size * tier.size
    total += Math.floor(area / perPortion)
  }
  return total
}

const args = process.argv.slice(2)
const json = args.includes('--json')
const [ref, file] = args.filter((a) => a !== '--json')
try {
  const order = findOrder(ref, file)
  const note = {
    ref: order.ref,
    date: order.date,
    tiers: order.tiers.length,
    servings: servings(order),
    boxes: order.tiers.map((t) => `${t.size + 2}in`),
    fragile: order.tiers.length > 2,
  }
  if (json) console.log(JSON.stringify(note))
  else {
    console.log(`DELIVERY ${note.ref} on ${note.date}`)
    console.log(`${note.tiers} tier(s), serves ${note.servings}`)
    console.log(`Boxes: ${note.boxes.join(', ')}${note.fragile ? '  ** STACK ON SITE **' : ''}`)
  }
} catch (error) {
  console.error(`delivery: ${error.message}`)
  process.exit(1)
}
