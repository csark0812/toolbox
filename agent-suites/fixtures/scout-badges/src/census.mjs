/** The census CSV the district office imports: a heading row, then one row per award. */
export function censusCsv(awards) {
  const rows = [Object.keys(awards[0]).join(',')]
  for (const award of awards) rows.push(Object.values(award).join(','))
  return rows.join('\n') + '\n'
}
