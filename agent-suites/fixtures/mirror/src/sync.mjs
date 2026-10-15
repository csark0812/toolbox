import { mapLimit } from './pool.mjs'

export const CONCURRENCY = 3

/** Uploads every file and returns a summary of what made it. */
export async function syncAll(files, upload) {
  const results = await mapLimit(files, CONCURRENCY, (file) => upload(file))
  const failed = results.flatMap((result, i) => (result.ok ? [] : [files[i].path]))
  return {
    uploaded: results.filter((result) => result.ok).length,
    failed,
    bytes: files.reduce((sum, file, i) => sum + (results[i].ok ? file.bytes : 0), 0),
  }
}

/** Human-readable size. */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}
