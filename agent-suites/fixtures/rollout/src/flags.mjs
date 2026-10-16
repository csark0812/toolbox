import { readFileSync } from 'node:fs'
import { bucket } from './hash.mjs'

export const FLAGS = JSON.parse(
  readFileSync(new URL('../config/flags.json', import.meta.url), 'utf8'),
)

const versionParts = (text) => text.split('.').map(Number)
function atLeast(version, minimum) {
  const [a, b] = [versionParts(version), versionParts(minimum)]
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]
  return true
}

/** Whether a user passes a flag's targeting rules. */
export function eligible(flag, user) {
  const rules = flag.rules ?? {}
  if (rules.countries && !rules.countries.includes(user.country)) return false
  if (rules.minAppVersion && !atLeast(user.appVersion, rules.minAppVersion)) return false
  return true
}

/** Whether `user` sees the flag named `name`: eligible, and inside the rollout percentage. */
export function isEnabled(name, user) {
  const flag = FLAGS[name]
  if (!flag) return false
  return eligible(flag, user) && bucket(name, user.id) < flag.percent
}
