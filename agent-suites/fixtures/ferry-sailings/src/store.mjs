// Stands in for the bookings database: every call takes a round trip.
const roundTrip = () => new Promise((resolve) => setImmediate(resolve))

export class SailingStore {
  constructor(sailings) {
    this.rows = new Map(sailings.map((sailing) => [sailing.id, structuredClone(sailing)]))
  }

  async get(id) {
    await roundTrip()
    const row = this.rows.get(id)
    return row && structuredClone(row)
  }

  async set(id, row) {
    await roundTrip()
    this.rows.set(id, structuredClone(row))
  }

  async all() {
    await roundTrip()
    return [...this.rows.values()].map((row) => structuredClone(row))
  }
}
