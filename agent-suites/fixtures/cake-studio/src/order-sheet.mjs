import { readFileSync } from 'node:fs'
import { config } from './orders.mjs'

const AREA = {
  round: (size) => Math.PI * (size / 2) ** 2,
  square: (size) => size * size,
  heart: (size) => size * size * 0.8,
}

// Portions for one tier, as the kitchen cuts them.
export function tierServings(tier, order) {
  const area = AREA[tier.shape]
  if (!area) throw new Error(`Unknown tier shape: ${tier.shape}`)
  const style = order.style ?? 'wedding'
  return Math.round(area(tier.size) / config.portionSqIn[style])
}

export function sponges(tier) {
  return tier.size >= 12 ? 3 : 2
}

const template = (name) =>
  readFileSync(new URL(`../templates/sheet-${name}.txt`, import.meta.url), 'utf8')

// {{name}} takes a field of the tier or order, or else the function of that name in this module.
function fill(text, tier, order, n) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (name === 'n') return String(n)
    if (tier && name in tier) return String(tier[name])
    if (name in order) return String(order[name] ?? '')
    return String(module[name](tier, order))
  })
}

const module = { tierServings, sponges }

export function orderSheet(order) {
  const head = fill(template('head'), null, { ...order, style: order.style ?? '(none given)' }, 0)
  const tiers = order.tiers.map((tier, i) => fill(template('tier'), tier, order, i + 1)).join('')
  return head + tiers
}
