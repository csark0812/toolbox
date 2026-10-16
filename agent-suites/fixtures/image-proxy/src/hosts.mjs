export const ALLOWED_HOSTS = ['cdn.shopfront.example', 'media.shopfront.example']

/** True when `url` is an https URL on one of our CDN hosts. */
export function isAllowed(url) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    return false
  }
  return parsed.protocol === 'https:' && ALLOWED_HOSTS.includes(parsed.hostname)
}
