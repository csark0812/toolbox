export class JobTimeout extends Error {}

/** Runs `job()` and rejects with JobTimeout if it takes longer than `timeoutMs`. */
export async function runWithTimeout(job, timeoutMs) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new JobTimeout(`timed out after ${timeoutMs}ms`)), timeoutMs)
  })
  try {
    return await Promise.race([job(), timeout])
  } finally {
    clearTimeout(timer)
  }
}
