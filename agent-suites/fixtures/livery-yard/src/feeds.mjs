import { yard } from './horses.mjs'

// Kilos of hay a day, to the nearest half kilo.
export function dailyHay(horse) {
  const percent = yard.hayPercentOfBodyweight[horse.workload]
  if (percent === undefined) throw new Error(`Unknown workload: ${horse.workload}`)
  return Math.round(((horse.weightKg * percent) / 100) * 2) / 2
}

export function hardFeedKg(horse) {
  if (!horse.hardFeed) return 0
  return yard.hardFeedKgPerDay[horse.workload] ?? 0
}

// Pence for `days` of feed. DIY owners bring their own hay.
export function feedCost(horse, days = 7) {
  const hay = horse.livery === 'diy' ? 0 : dailyHay(horse) * yard.hayPencePerKg
  const hard = horse.hardFeed ? hardFeedKg(horse) * yard.hardFeedPencePerKg[horse.hardFeed] : 0
  return Math.round(days * (hay + hard))
}

export function feedPlan(horses) {
  return [...horses]
    .sort((a, b) => a.box - b.box)
    .map((horse) => ({
      box: horse.box,
      name: horse.name,
      hayKg: dailyHay(horse),
      nets: Math.ceil(dailyHay(horse) / yard.haynetKg),
      hardFeed: hardFeedKg(horse) ? `${hardFeedKg(horse)}kg ${horse.hardFeed}` : '—',
    }))
}
