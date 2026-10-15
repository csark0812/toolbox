/** Fixed-width table of recipes for the terminal. */
export function table(recipes) {
  const rows = recipes.map((r) => [r.id, r.title, `${r.minutes} min`, r.category])
  const widths = rows[0].map((_, col) => Math.max(...rows.map((row) => row[col].length)))
  return rows.map((row) => row.map((cell, col) => cell.padEnd(widths[col])).join('  ')).join('\n')
}
