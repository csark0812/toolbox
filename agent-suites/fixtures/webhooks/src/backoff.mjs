/** Delay before the next attempt: exponential from `baseDelayMs`, but never sooner than the endpoint asked. */
export function nextDelay(attempt, baseDelayMs, retryAfterMs = 0) {
  return Math.max(baseDelayMs * 2 ** (attempt - 1), retryAfterMs)
}

/** Retry-After header (seconds) in milliseconds, or 0. */
export function retryAfterMs(headers = {}) {
  const seconds = Number(headers['retry-after'])
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0
}
