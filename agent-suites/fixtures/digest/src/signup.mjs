// Account creation for the signup flow shipped on 2026-09-21. The flow asks for a time zone;
// people can skip that step.
let nextId = 1000

export function createUser({ email, timezone = null }, now = Date.now()) {
  return {
    id: `u${nextId++}`,
    email,
    timezone,
    prefs: { digest: true },
    createdAt: new Date(now).toISOString(),
  }
}
