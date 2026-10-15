export const ZONES = {
  A: { baseCents: 495, perKgCents: 120 },
  B: { baseCents: 695, perKgCents: 180 },
  C: { baseCents: 995, perKgCents: 260 },
}

const VOLUMETRIC_DIVISOR = 5000

export function billableKg(weightKg, lengthCm, widthCm, heightCm) {
  const volumetric = (lengthCm * widthCm * heightCm) / VOLUMETRIC_DIVISOR
  return Math.ceil(Math.max(weightKg, volumetric) * 2) / 2
}

/** Price in cents to ship one parcel. Express costs 50% more. */
export function quote(weightKg, lengthCm, widthCm, heightCm, zone, express) {
  const rate = ZONES[zone]
  if (!rate) throw new RangeError(`Unknown zone ${zone}`)
  const kg = billableKg(weightKg, lengthCm, widthCm, heightCm)
  const cents = rate.baseCents + Math.round(kg * rate.perKgCents)
  return express ? Math.round(cents * 1.5) : cents
}
