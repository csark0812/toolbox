import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

let state
/** Reloads the records from data/ (the tests call this between cases). */
export function reset() {
  state = { parcels: load('parcels'), recipients: load('recipients'), stops: [] }
}
reset()

export const parcels = () => state.parcels
export const recipients = () => state.recipients
export const stops = () => state.stops

/** Stores a parcel, replacing the one with the same tracking number. */
export function saveParcel(parcel) {
  state.parcels = state.parcels.filter((entry) => entry.number !== parcel.number).concat(parcel)
}

/** Adds a delivery stop to a driver's route for the given day. */
export function addStop(date, number) {
  state.stops = state.stops.concat({ date, number })
}
