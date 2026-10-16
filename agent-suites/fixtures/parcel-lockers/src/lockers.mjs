/** Parcels sitting in a locker at time `at` (ISO), by locker. */
export function occupied(parcels, at) {
  const now = Date.parse(at)
  return parcels
    .filter((p) => Date.parse(p.deliveredAt) <= now)
    .filter((p) => !p.collectedAt || Date.parse(p.collectedAt) > now)
    .sort((a, b) => a.locker.localeCompare(b.locker))
}

/** Whole hours a parcel has been in its locker at `at`. */
export const hoursIn = (parcel, at) =>
  Math.floor((Date.parse(at) - Date.parse(parcel.deliveredAt)) / 3600000)
