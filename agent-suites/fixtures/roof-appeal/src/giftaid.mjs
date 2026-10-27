export const RATE = 0.25

const rows = (text) => {
  const [header, ...lines] = text.trim().split('\n')
  const keys = header.split(',')
  return lines.map((line) =>
    Object.fromEntries(line.split(',').map((value, i) => [keys[i], value])),
  )
}

export function parseDonors(text) {
  return new Map(rows(text).map((donor) => [donor.donorId, donor]))
}

export function parseDonations(text) {
  return rows(text).map((gift) => ({ ...gift, amount: Number(gift.amount) }))
}

export function inQuarter(date, quarter) {
  const [year, q] = quarter.split('-Q')
  const month = Number(date.slice(5, 7))
  return date.slice(0, 4) === year && Math.ceil(month / 3) === Number(q)
}

// Whether a gift is covered by its donor's Gift Aid declaration.
export function covered(gift, donor) {
  if (!donor || !donor.declared) return false
  if (gift.source === 'raffle') return false
  return gift.date >= donor.declared
}

export function quarterClaim(donations, donors, quarter) {
  const gifts = donations.filter(
    (gift) => inQuarter(gift.date, quarter) && covered(gift, donors.get(gift.donorId)),
  )
  const pence = gifts.reduce((sum, gift) => sum + Math.round(gift.amount * 100), 0)
  return { gifts, total: pence / 100, giftAid: Math.round(pence * RATE) / 100 }
}
