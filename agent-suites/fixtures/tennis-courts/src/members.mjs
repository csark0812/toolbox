/** The membership list from the office export: code -> { name, expires }. */
export function loadMembers(text) {
  const members = new Map()
  for (const line of text.split('\n').slice(1)) {
    const row = line.trim()
    if (!row) continue
    const [code, name, expires] = row.split(',').map((field) => field.trim())
    members.set(code, { name, expires })
  }
  return members
}
