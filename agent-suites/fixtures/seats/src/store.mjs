// Key-value store client. Every call is a network round trip.
const roundTrip = () => new Promise((resolve) => setTimeout(resolve, 1 + Math.random() * 4))

export function createStore() {
  const data = new Map()
  return {
    async get(key) {
      await roundTrip()
      return data.has(key) ? structuredClone(data.get(key)) : undefined
    },
    async set(key, value) {
      await roundTrip()
      data.set(key, structuredClone(value))
    },
    async delete(key) {
      await roundTrip()
      data.delete(key)
    },
    async keys(prefix) {
      await roundTrip()
      return [...data.keys()].filter((key) => key.startsWith(prefix))
    },
  }
}
