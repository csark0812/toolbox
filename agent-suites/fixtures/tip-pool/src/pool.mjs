import { POINTS_PER_HOUR } from './roles.mjs'

const minutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Paid minutes on a shift: a 30-minute unpaid break comes off shifts longer than six hours. */
export function paidMinutes(shift) {
  const worked = minutes(shift.out) - minutes(shift.in)
  return worked > 360 ? worked - 30 : worked
}

/** Each person's share of the day's tips in pence, and the pennies left for the social fund. */
export function split(shifts, tipsPence) {
  const points = shifts.map((shift) => {
    const perHour = POINTS_PER_HOUR[shift.role]
    if (perHour === undefined) throw new RangeError(`unknown role "${shift.role}"`)
    return { name: shift.name, role: shift.role, points: (paidMinutes(shift) / 60) * perHour }
  })
  const total = points.reduce((sum, p) => sum + p.points, 0)
  const shares = points.map((p) => ({
    ...p,
    pence: total ? Math.floor((tipsPence * p.points) / total) : 0,
  }))
  return { shares, leftover: tipsPence - shares.reduce((sum, s) => sum + s.pence, 0) }
}
