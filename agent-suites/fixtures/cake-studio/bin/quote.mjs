import { pathToFileURL } from 'node:url'
import { config, findOrder, pounds } from '../src/orders.mjs'

export function servingsFor(tier, style) {
  const perPortion = config.portionSqIn[style]
  if (!perPortion) throw new Error(`Unknown portion style: ${style}`)
  const area = tier.shape === 'square' ? tier.size ** 2 : Math.PI * (tier.size / 2) ** 2
  return Math.floor(area / perPortion)
}

export function quote(order) {
  const rate = config.pencePerPortion[order.flavour]
  if (!rate) throw new Error(`Unknown flavour: ${order.flavour}`)
  const lines = order.tiers.map((tier) => {
    const portions = servingsFor(tier, order.style)
    return { text: `${tier.size}" ${tier.shape}, ${portions} portions`, pence: portions * rate }
  })
  if (order.miles)
    lines.push({
      text: `Delivery, ${order.miles} miles`,
      pence: order.miles * config.deliveryPencePerMile,
    })
  return { lines, total: lines.reduce((sum, line) => sum + line.pence, 0) }
}

function parseArgs(args) {
  const order = { ref: 'enquiry', tiers: [], miles: 0, flavour: 'sponge' }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--style') order.style = args[++i]
    else if (args[i] === '--flavour') order.flavour = args[++i]
    else if (args[i] === '--miles') order.miles = Number(args[++i])
    else {
      const [shape, size] = args[i].split(':')
      order.tiers.push({ shape, size: Number(size) })
    }
  }
  return order
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  try {
    const order = args[0]?.startsWith('C-') ? findOrder(args[0], args[1]) : parseArgs(args)
    const { lines, total } = quote(order)
    console.log(`Quote ${order.ref}`)
    for (const line of lines)
      console.log(`  ${line.text.padEnd(30)}${pounds(line.pence).padStart(10)}`)
    console.log(`  ${'Total'.padEnd(30)}${pounds(total).padStart(10)}`)
  } catch (error) {
    console.error(`quote: ${error.message}`)
    process.exit(1)
  }
}
