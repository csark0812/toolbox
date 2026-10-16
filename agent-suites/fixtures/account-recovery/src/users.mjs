import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const derive = promisify(scrypt)

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const key = await derive(password, salt, 32)
  return `${salt.toString('hex')}:${key.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':').map((part) => Buffer.from(part, 'hex'))
  const candidate = await derive(password, salt, 32)
  return timingSafeEqual(candidate, key)
}

/** An in-memory user store; production swaps in the database-backed one with the same shape. */
export function createUsers() {
  const byId = new Map()
  return {
    async add({ id, email, password }) {
      byId.set(id, { id, email: email.toLowerCase(), hash: await hashPassword(password) })
    },
    findByEmail(email) {
      return [...byId.values()].find((user) => user.email === email) ?? null
    },
    findById(id) {
      return byId.get(id) ?? null
    },
    async setPassword(id, password) {
      byId.get(id).hash = await hashPassword(password)
    },
  }
}
