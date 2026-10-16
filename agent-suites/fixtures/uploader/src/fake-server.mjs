import { createHash } from 'node:crypto'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * In-memory storage server. `failures` maps a part number to how many of its attempts fail
 * before one succeeds. `latency(part, attempt)` gives each request's delay in milliseconds.
 */
export function createFakeServer({ failures = {}, latency = () => 5 } = {}) {
  const parts = new Map()
  const attempts = new Map()
  let inFlight = 0
  const stats = { requests: 0, maxInFlight: 0 }
  return {
    stats,
    async putPart(part, bytes) {
      stats.requests++
      inFlight++
      stats.maxInFlight = Math.max(stats.maxInFlight, inFlight)
      const attempt = (attempts.get(part) ?? 0) + 1
      attempts.set(part, attempt)
      try {
        await sleep(latency(part, attempt))
        if (attempt <= (failures[part] ?? 0)) throw new Error(`503 for part ${part}`)
        const etag = createHash('md5').update(bytes).digest('hex')
        parts.set(etag, Buffer.from(bytes))
        return etag
      } finally {
        inFlight--
      }
    },
    async complete(etags, sha256) {
      const file = Buffer.concat(etags.map((etag) => parts.get(etag)))
      const actual = createHash('sha256').update(file).digest('hex')
      if (actual !== sha256) throw new Error(`checksum mismatch: expected ${sha256}, got ${actual}`)
      return { bytes: file.length, sha256: actual, file }
    },
  }
}
