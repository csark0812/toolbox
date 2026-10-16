import { fee, stayMinutes } from './fees.mjs'

/** Stays with their durations and fees, optionally for one plate. */
export function listStays(stays, plate) {
  return stays
    .filter((stay) => !plate || stay.plate === plate)
    .map((stay) => ({ ...stay, minutes: stayMinutes(stay), cents: fee(stay) }))
}
