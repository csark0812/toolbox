import { createHash } from 'node:crypto'

/** Cut `bytes` into chunks of `size` bytes (the last one may be shorter). */
export function chunk(bytes, size) {
  const chunks = []
  for (let offset = 0; offset < bytes.length; offset += size)
    chunks.push(bytes.subarray(offset, offset + size))
  return chunks
}

async function sendPart(server, part, bytes, retries) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await server.putPart(part, bytes)
    } catch (error) {
      if (attempt >= retries) throw error
    }
  }
}

/** Upload `bytes` in parallel chunks and ask the server to assemble them. */
export async function uploadFile(
  bytes,
  server,
  { chunkSize = 64 * 1024, concurrency = 4, retries = 3 } = {},
) {
  const chunks = chunk(bytes, chunkSize)
  const etags = []
  let next = 0
  async function worker() {
    while (next < chunks.length) {
      const part = next++
      etags.push(await sendPart(server, part, chunks[part], retries))
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, chunks.length) }, worker))
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  return server.complete(etags, sha256)
}
