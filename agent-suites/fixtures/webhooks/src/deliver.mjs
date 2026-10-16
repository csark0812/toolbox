import { nextDelay, retryAfterMs } from './backoff.mjs'

const retryable = (status) => status === 0 || status === 408 || status === 429 || status >= 500

/**
 * Delivers one event, retrying failures. `send(event)` resolves to { status, headers }
 * (status 0 means the request timed out). Returns { delivered, attempts, reason, log }.
 */
export async function deliver(event, send, config, { now, sleep }) {
  const started = now()
  const log = []
  for (let attempt = 1; ; attempt++) {
    const { status, headers } = await send(event)
    log.push({ at: now() - started, attempt, status })
    if (status >= 200 && status < 300) return { delivered: true, attempts: attempt, log }
    if (!retryable(status)) return { delivered: false, attempts: attempt, reason: 'rejected', log }
    if (attempt > config.retries)
      return { delivered: false, attempts: attempt, reason: 'retries exhausted', log }
    const delay = nextDelay(attempt, config.baseDelayMs, retryAfterMs(headers))
    if (now() - started + delay > config.deadlineMs)
      return { delivered: false, attempts: attempt, reason: 'deadline', log }
    await sleep(delay)
  }
}
