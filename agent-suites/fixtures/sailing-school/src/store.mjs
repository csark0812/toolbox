import { readFileSync } from 'node:fs'

const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url)))

/** A fresh in-memory store loaded from the data files. */
export function openStore() {
  return { courses: load('courses'), bookings: load('bookings'), refunds: [] }
}
