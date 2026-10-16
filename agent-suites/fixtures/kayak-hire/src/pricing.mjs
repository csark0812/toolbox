export const RATES = { single: 1200, double: 1800, sup: 1400 }
export const DEPOSIT = 2500
export const LATE_BLOCK_MINUTES = 15
export const LATE_BLOCK_PENCE = 500

const minutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Hire charge: per started hour between going out and the due time. */
export function hireCharge(booking) {
  const rate = RATES[booking.craft]
  if (rate === undefined) throw new RangeError(`unknown craft "${booking.craft}"`)
  return Math.ceil((minutes(booking.due) - minutes(booking.out)) / 60) * rate
}

/** Late fee for a returned booking. */
export function lateFee(booking) {
  if (!booking.returned) return 0
  const late = minutes(booking.returned) - minutes(booking.due)
  if (late < 0) return 0
  return (Math.floor(late / LATE_BLOCK_MINUTES) + 1) * LATE_BLOCK_PENCE
}

/** The bill: hire, deposit, late fee and the deposit refunded. */
export function bill(booking) {
  const fee = lateFee(booking)
  return {
    hire: hireCharge(booking),
    deposit: DEPOSIT,
    late: fee,
    refund: booking.returned ? Math.max(0, DEPOSIT - fee) : 0,
  }
}

export const pounds = (pence) => `£${(pence / 100).toFixed(2)}`
