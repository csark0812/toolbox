// In-memory stand-in for the users table.
const seed = () => [
  { id: 1, name: 'Mara Quist', role: 'admin' },
  { id: 4, name: 'Tom Hale', role: 'manager' },
  { id: 7, name: 'Ines Okafor', role: 'viewer' },
  { id: 9, name: 'Lev Sato', role: 'viewer' },
]
let users = seed()
export const stats = { reads: 0 }

export function getUser(id) {
  stats.reads++
  const user = users.find((entry) => entry.id === Number(id))
  return user ? { ...user } : undefined
}

export function updateUser(id, patch) {
  const user = users.find((entry) => entry.id === Number(id))
  if (!user) throw new Error(`No user ${id}`)
  Object.assign(user, patch)
  return { ...user }
}

export function listUsers() {
  stats.reads++
  return users.map((user) => ({ ...user }))
}

/** Restores the seed data (tests and the demo start from a clean table). */
export function resetDb() {
  users = seed()
  stats.reads = 0
}
