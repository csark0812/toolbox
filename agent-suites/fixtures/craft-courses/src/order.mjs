/** Sign-ups in the order they were sent, earliest first. */
export function bySignupTime(signups) {
  return [...signups].sort((a, b) => a.at - b.at)
}
