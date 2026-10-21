export const COLLECTION = '10:00-12:00'

/** The parcel size for a household of this many people. */
export function parcelSize(people) {
  if (people > 5) return 'large'
  if (people >= 3) return 'medium'
  return 'small'
}

/** Referrals still to be packed. */
export function toPack(referrals) {
  return referrals.filter((referral) => referral.status !== 'cancelled')
}

/** Parcels for one collection day, in referral order. */
export function packingList(referrals, day) {
  return toPack(referrals)
    .filter((referral) => referral.day === day)
    .map((referral) => ({ ...referral, size: parcelSize(referral.people) }))
}

/** How many parcels of each size the week needs. */
export function weekCounts(referrals) {
  const counts = { small: 0, medium: 0, large: 0 }
  for (const referral of toPack(referrals)) counts[parcelSize(referral.people)]++
  return counts
}
