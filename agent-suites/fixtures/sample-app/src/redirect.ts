export function nextUrlAfterLogin(rawTarget: string | undefined): string {
  if (!rawTarget) {
    return '/dashboard'
  }

  const target = rawTarget.trim()
  if (!target.startsWith('/')) {
    return '/dashboard'
  }

  return target.split('?')[0] ?? '/dashboard'
}
