export const GIFT_AID_RATE = 0.25

/** The declaration this donation was made under, if any. */
export function findDeclaration(donation, declarations) {
  const surname = donation.name.split(' ').at(-1)
  return declarations.find(
    (declaration) => declaration.surname === surname && declaration.postcode === donation.postcode,
  )
}

/** Whether the declaration covers a donation made on this date (both 'YYYY-MM-DD'). */
export function covers(declaration, date) {
  if (date < declaration.signed) return false
  if (declaration.cancelled && date >= declaration.cancelled) return false
  return true
}

/** The Gift Aid we can claim on a donation, in pounds (0 if none). */
export function giftAid(donation, declarations) {
  const declaration = findDeclaration(donation, declarations)
  if (!declaration || !covers(declaration, donation.date)) return 0
  return donation.amount * GIFT_AID_RATE
}
