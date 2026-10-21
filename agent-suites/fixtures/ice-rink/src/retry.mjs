import { stderr } from 'node:process'

/**
 * Calls a callback-style `task(...args, callback)` up to `attempts` times, waiting `delayMs`
 * between tries, and calls `done(error, result)` with the last outcome.
 */
export function withRetry(task, attempts, delayMs, ...rest) {
  const done = rest.pop()
  const attempt = (number) =>
    task(...rest, (error, result) => {
      if (!error || number >= attempts) return done(error, result)
      stderr.write(`Retrying (attempt ${number + 1} of ${attempts})\n`)
      setTimeout(() => attempt(number + 1), delayMs)
    })
  attempt(1)
}
