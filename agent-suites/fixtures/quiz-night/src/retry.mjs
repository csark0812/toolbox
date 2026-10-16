/**
 * Calls a callback-style function, retrying while the file is busy (the leaderboard may be reading
 * it). callback(error, value) gets the last outcome.
 */
export function withRetry(fn, args, attempts, callback) {
  fn(...args, (error, value) => {
    if (error?.code === 'EBUSY' && attempts > 1)
      return setTimeout(() => withRetry(fn, args, attempts - 1, callback), 20)
    callback(error, value)
  })
}
