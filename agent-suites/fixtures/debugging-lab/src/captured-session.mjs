export function validateCapturedSession(expiry, now) {
  return Math.floor(Number(expiry) / 1000) > now
}
