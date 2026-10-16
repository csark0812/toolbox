/** Stock by family, oldest seed first; seed older than three seasons is flagged. */
export async function seasonReport(season) {
  const { default: Catalog } = await import('./catalog.mjs')
  const families = new Map()
  for (const entry of Catalog.all().sort(
    (a, b) => a.year - b.year || a.variety.localeCompare(b.variety),
  )) {
    if (!families.has(entry.family)) families.set(entry.family, [])
    families.get(entry.family).push(entry)
  }
  const lines = []
  for (const family of [...families.keys()].sort()) {
    lines.push(family)
    for (const entry of families.get(family)) {
      const old = season - entry.year > 3 ? '  (old seed)' : ''
      lines.push(`  ${entry.variety} ${entry.year}: ${entry.packets}${old}`)
    }
  }
  return lines
}
