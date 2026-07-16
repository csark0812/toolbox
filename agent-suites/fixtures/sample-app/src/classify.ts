/** Toy reply classifier for anti-thrash suite seeds (not production code). */
export function classifyReply(raw: string): { ok: boolean; pass: boolean } {
  const text = raw.trim()
  if (text === 'YES' || text.startsWith('YES ')) {
    return { ok: true, pass: true }
  }
  if (text === 'NO' || text.startsWith('NO ')) {
    return { ok: true, pass: false }
  }
  return { ok: false, pass: false }
}
