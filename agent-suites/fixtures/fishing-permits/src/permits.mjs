/** The association's waters: rate per rod per day in pence, minimum billed days and the rod limit. */
export const WATERS = {
  kennet: { name: 'Kennet (Hungerford beat)', dayRate: 3200, minDays: 1, rodLimit: 2 },
  test: { name: 'Test (Longstock)', dayRate: 5500, minDays: 2, rodLimit: 1 },
  avon: { name: 'Avon (Ringwood)', dayRate: 1800, minDays: 1, rodLimit: 3 },
  lake: { name: 'Club lake', dayRate: 900, minDays: 1, rodLimit: 4 },
}

const ANGLER_RATES = { adult: 1, senior: 0.75, junior: 0.5 }

/** Prices a permit. Returns what was billed, with the total in pence. */
export function quotePermit(
  water,
  days = WATERS[water]?.minDays,
  angler = 'adult',
  rods = 1,
  concession = angler === 'junior',
) {
  const site = WATERS[water]
  if (!site) throw new Error(`Unknown water: ${water}`)
  if (!(angler in ANGLER_RATES)) throw new Error(`Unknown angler type: ${angler}`)
  if (rods > site.rodLimit) throw new Error(`${site.name} allows at most ${site.rodLimit} rods`)
  const billed = Math.max(days, site.minDays)
  let pence = site.dayRate * billed * rods * ANGLER_RATES[angler]
  if (billed >= 7) pence *= 0.85
  if (concession) pence *= 0.9
  return { water: site.name, days: billed, angler, rods, concession, pence: Math.round(pence) }
}

export const formatPence = (pence) => `£${(pence / 100).toFixed(2)}`

/** One line per quote, as printed on the counter slip. */
export function describe(quote) {
  const rods = quote.rods === 1 ? '1 rod' : `${quote.rods} rods`
  const days = quote.days === 1 ? '1 day' : `${quote.days} days`
  const extra = quote.concession ? ', concession' : ''
  return `${quote.water}: ${days}, ${quote.angler}, ${rods}${extra} = ${formatPence(quote.pence)}`
}
