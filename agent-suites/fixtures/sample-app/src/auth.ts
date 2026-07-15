export interface Session {
  userId: string
  expiresAt: number
}

export function isSessionActive(session: Session | undefined, now = Date.now()): boolean {
  if (!session) {
    return false
  }

  return session.expiresAt > now
}
