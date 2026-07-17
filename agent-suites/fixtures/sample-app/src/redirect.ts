export function nextUrlAfterLogin(rawTarget: string | undefined): string {
  if (!rawTarget) {
    return '/dashboard'
  }

  const target = rawTarget.trim()
  if (!target.startsWith('/')) {
    return '/dashboard'
  }

  // Preserve query/hash for safe relative paths (closes theme query-preservation).
  if (target.startsWith('//') || target.includes('://')) {
    return '/dashboard'
  }

  return target
}
