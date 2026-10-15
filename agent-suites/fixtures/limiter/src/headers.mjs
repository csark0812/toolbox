// Builds the standard rate-limit response headers.
export function rateLimitHeaders(limit, remaining) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(0, remaining)),
  }
}
