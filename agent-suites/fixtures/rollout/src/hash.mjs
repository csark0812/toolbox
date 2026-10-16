import { createHash } from 'node:crypto'

/** A stable bucket 0-99 for a user and flag. */
export function bucket(flagName, userId) {
  const digest = createHash('sha256').update(`${flagName}:${userId}`).digest()
  return digest.readUInt32BE(0) % 100
}
