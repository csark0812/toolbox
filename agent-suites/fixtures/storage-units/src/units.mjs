import { pounds } from './money.mjs'

const ordinal = (n) => {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  return `${n}${{ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th'}`
}

/** One line of the units list. */
export function unitLine(unit) {
  const paid = unit.firstUnpaid ? `owes from ${unit.firstUnpaid}` : 'paid up'
  return `${unit.id}  ${unit.tenant.padEnd(11)} ${pounds(unit.rent)}/month, due on the ${ordinal(unit.dueDay)}  ${paid}`
}
