// A stand-in for the upstream feed: the publisher posts a few items a day.
export function fakeFeed(now = Date.now) {
  let calls = 0
  return async () => {
    calls += 1
    const day = Math.floor(now() / 86_400_000) * 86_400_000
    return [
      { title: `Morning brief (fetch ${calls})`, publishedAt: day + 7 * 3_600_000 },
      { title: 'Markets open', publishedAt: day + 9 * 3_600_000 },
    ]
  }
}
