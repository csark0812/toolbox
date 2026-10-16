/** Total size of each entry directly inside `folder`, largest first, then by name. */
export function entriesIn(files, folder = '') {
  const prefix = folder ? `${folder.replace(/\/+$/, '')}/` : ''
  const totals = new Map()
  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue
    const [name, ...rest] = file.path.slice(prefix.length).split('/')
    const key = rest.length ? `${name}/` : name
    totals.set(key, (totals.get(key) ?? 0) + file.size)
  }
  return [...totals]
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name))
}
